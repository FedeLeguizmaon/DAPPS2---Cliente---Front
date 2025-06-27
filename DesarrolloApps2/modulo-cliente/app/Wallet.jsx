import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';
import { SocketContext } from './SocketContext';

const Wallet = () => {
  const navigation = useNavigation();
  const [walletData, setWalletData] = useState({
    saldoPesos: 0,
    saldoCrypto: 0,
    precioCrypto: 1
  });
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Usar SocketContext centralizado en lugar de WebSocket propio
  const socketContext = useContext(SocketContext);

  useEffect(() => {
    loadWalletData();
    
    // Polling cada 30 segundos para verificar pagos pendientes (fallback)
    const interval = setInterval(loadWalletData, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // ✅ Escuchar eventos del SocketContext centralizado
  useEffect(() => {
    if (!socketContext || !socketContext.events) {
      console.log('⏳ Wallet: Esperando SocketContext...');
      return;
    }

    const { events } = socketContext;
    console.log('👂 Wallet: Escuchando eventos del SocketContext, total:', events.length);

    // Procesar solo eventos relacionados con billetera
    const walletEvents = events.filter(event => {
      const isWalletEvent = event.type === 'core_event' && 
        (event.topic?.includes('fiat') || 
         event.topic?.includes('crypto') || 
         event.topic?.includes('balance') ||
         event.event?.includes('crypto') ||
         event.event?.includes('fiat'));
      
      if (isWalletEvent) {
        console.log('💰 Wallet: Evento de billetera detectado:', event);
      }
      
      return isWalletEvent;
    });

    if (walletEvents.length > 0) {
      const latestEvent = walletEvents[walletEvents.length - 1];
      handleBlockchainEvent(latestEvent);
    }
  }, [socketContext?.events]);

  const loadWalletData = async () => {
    try {
      console.log('Loading wallet data...');
      
      const [walletResponse, transaccionesResponse] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transacciones')
      ]);
      
      console.log('Wallet response:', walletResponse);
      console.log('Transactions response:', transaccionesResponse);
      
      setWalletData(walletResponse);
      setTransacciones(transaccionesResponse);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('autenticación')) {
        Alert.alert(
          'Sesión Expirada', 
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{ 
            text: 'Ir a Login', 
            onPress: () => navigation.navigate('Login') 
          }]
        );
      } else {
        Alert.alert('Error', `No se pudo cargar la información de la billetera: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Esta función ya no es necesaria, usamos SocketContext centralizado

  const handleBlockchainEvent = (evento) => {
    console.log('💰 Wallet: Procesando evento blockchain:', evento);
    
    const { topic, data } = evento;

    switch (topic) {
      case 'fiat.deposit.response':
        if (data.status === 'SUCCESS') {
          console.log('💰 Depósito fiat exitoso');
          updateBalancesFromBlockchain(data);
          showSuccessNotification('¡Saldo cargado exitosamente!');
        }
        break;

      case 'buy.crypto.response':
        if (data.status === 'SUCCESS') {
          console.log('🪙 Compra crypto exitosa');
          updateBalancesFromBlockchain(data);
          showSuccessNotification('¡Compra de crypto exitosa!');
        }
        break;

      case 'sell.crypto.response':
        if (data.status === 'SUCCESS') {
          console.log('💸 Venta crypto exitosa');
          updateBalancesFromBlockchain(data);
          showSuccessNotification('¡Venta de crypto exitosa!');
        }
        break;

      case 'get.balances.response':
        console.log('💼 Saldos actualizados desde blockchain');
        updateBalancesFromBlockchain(data);
        break;

      default:
        console.log('📋 Wallet: Evento no manejado:', topic);
    }
  };

  const updateBalancesFromBlockchain = (data) => {
    console.log('💰 Actualizando saldos con data:', data);
    
    // Actualizar saldos con datos del blockchain
    setWalletData(prev => ({
      ...prev,
      saldoPesos: parseFloat(data.currentFiatBalance || data.fiatBalance || prev.saldoPesos),
      saldoCrypto: parseFloat(data.currentCryptoBalance || data.cryptoBalance || prev.saldoCrypto)
    }));
    
    // Recargar transacciones para mostrar la nueva operación
    console.log('🔄 Recargando historial de transacciones...');
    loadWalletData();
  };

  const showSuccessNotification = (message) => {
    Alert.alert('✅ Operación Exitosa', message);
  };

  // ✅ Estas funciones ahora están en SocketContext, no necesitamos duplicarlas aquí

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleCargarSaldo = () => {
    navigation.navigate('ExternalBrowserCargarSaldo');
  };

  const handleComprarCrypto = () => {
    navigation.navigate('Crypto', { 
      saldoPesos: walletData.saldoPesos,
      saldoCrypto: walletData.saldoCrypto,
      precioCrypto: walletData.precioCrypto 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatCrypto = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  const getTransactionIcon = (tipo) => {
    switch (tipo) {
      case 'CARGA_SALDO': return '💰';
      case 'COMPRA_CRYPTO': return '🪙';
      case 'VENTA_CRYPTO': return '💸';
      case 'PAGO_PEDIDO': return '🛍️';
      default: return '📄';
    }
  };

  const getTransactionStatus = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return { text: 'Completada', color: '#4caf50' };
      case 'PENDIENTE': return { text: 'Pendiente', color: '#ff9800' };
      case 'FALLIDA': return { text: 'Fallida', color: '#f44336' };
      case 'CANCELADA': return { text: 'Cancelada', color: '#9e9e9e' };
      default: return { text: estado, color: '#333' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
    <View style={styles.header}>
      <View style={styles.placeholder} />
      <Text style={styles.title}>Mi Billetera</Text>
      
      {/* ✅ Debug info del SocketContext */}
      {socketContext && (
        <Text style={styles.debugInfo}>
          {socketContext.connected ? '🟢 Conectado' : '🔴 Desconectado'} 
          {socketContext.hasAuth ? ' 🔐' : ' ❌'}
        </Text>
      )}
      <TouchableOpacity onPress={onRefresh}>
        <Text style={styles.refreshButton}>🔄</Text>
      </TouchableOpacity>
    </View>

      {/* Saldo Cards */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo en Pesos</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(walletData.saldoPesos)}
          </Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCargarSaldo}
          >
            <Text style={styles.actionButtonText}>Cargar con MP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo en crypto</Text>
          <Text style={styles.balanceAmount}>
            {formatCrypto(walletData.saldoCrypto)} DC
          </Text>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cryptoButton]}
            onPress={handleComprarCrypto}
          >
            <Text style={styles.actionButtonText}>Operar Crypto</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transacciones */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Historial de Transacciones</Text>
        
        {transacciones.length === 0 ? (
          <Text style={styles.noTransactions}>No hay transacciones</Text>
        ) : (
          transacciones.map((transaccion, index) => {
            const status = getTransactionStatus(transaccion.estado);
            return (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionEmoji}>
                    {getTransactionIcon(transaccion.tipo)}
                  </Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaccion.descripcion}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaccion.fechaCreacion).toLocaleDateString('es-AR')}
                  </Text>
                  <Text style={[styles.transactionStatus, { color: status.color }]}>
                    {status.text}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionAmountText,
                    transaccion.tipo === 'CARGA_SALDO' && styles.positiveAmount,
                    transaccion.tipo === 'COMPRA_CRYPTO' && styles.negativeAmount
                  ]}>
                    {transaccion.tipo === 'CARGA_SALDO' ? '+' : '-'}
                    {formatCurrency(transaccion.monto)}
                  </Text>
                  {transaccion.cantidadCrypto && (
                    <Text style={styles.cryptoAmountSmall}>
                      +{formatCrypto(transaccion.cantidadCrypto)} DC
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 5,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    fontSize: 24,
    padding: 10,
  },
  infoBanner: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  infoBannerText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    gap: 15,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start', // ya no necesitamos 'space-between'
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cryptoAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 5,
  },
  cryptoPrice: {
    fontSize: 12,
    color: '#777',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#009ee3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cryptoButton: {
    backgroundColor: '#f39c12',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  noTransactions: {
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
    marginTop: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#777',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  positiveAmount: {
    color: '#4caf50',
  },
  negativeAmount: {
    color: '#f44336',
  },
  cryptoAmountSmall: {
    fontSize: 12,
    color: '#f39c12',
    marginTop: 2,
  },
  testingInfo: {
    backgroundColor: '#fff3cd',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  testingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  testingText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  placeholder: {
    width: 40,
  },
  debugInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default Wallet;