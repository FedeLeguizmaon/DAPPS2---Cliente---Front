import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../utils/api';

const Crypto = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { saldoPesos = 0, saldoCrypto = 0, precioCrypto = 1 } = route.params || {};

  // Estados para compra/venta
  const [operacion, setOperacion] = useState('compra'); // 'compra' o 'venta'
  const [montoPesos, setMontoPesos] = useState('');
  const [cantidadCrypto, setCantidadCrypto] = useState('');
  const [loading, setLoading] = useState(false);
  const [precioActual, setPrecioActual] = useState(precioCrypto);

  useEffect(() => {
    loadPrecioCrypto();
  }, []);

  useEffect(() => {
    if (operacion === 'compra') {
      calculateCrypto();
    } else {
      calculatePesos();
    }
  }, [montoPesos, cantidadCrypto, operacion, precioActual]);

  const loadPrecioCrypto = async () => {
    try {
      const response = await api.get('/wallet/crypto/price');
      setPrecioActual(response.precio || 1);
    } catch (error) {
      console.error('Error loading crypto price:', error);
      setPrecioActual(1); // Precio fijo 1:1
    }
  };

  const calculateCrypto = () => {
    if (operacion !== 'compra') return;
    
    const monto = parseFloat(montoPesos);
    if (!isNaN(monto) && monto > 0) {
      // Precio 1:1 - 1 peso = 1 token
      setCantidadCrypto(monto.toFixed(2));
    } else {
      setCantidadCrypto('');
    }
  };

  const calculatePesos = () => {
    if (operacion !== 'venta') return;
    
    const cantidad = parseFloat(cantidadCrypto);
    if (!isNaN(cantidad) && cantidad > 0) {
      // Precio 1:1 - 1 token = 1 peso
      setMontoPesos(cantidad.toFixed(2));
    } else {
      setMontoPesos('');
    }
  };

  const validateOperacion = () => {
    if (operacion === 'compra') {
      const monto = parseFloat(montoPesos);
      if (isNaN(monto) || monto <= 0) {
        Alert.alert('Error', 'Por favor ingrese un monto válido');
        return false;
      }
      if (monto < 100) {
        Alert.alert('Error', 'El monto mínimo para comprar crypto es $100');
        return false;
      }
      if (monto > saldoPesos) {
        Alert.alert('Error', 'Saldo en pesos insuficiente');
        return false;
      }
    } else {
      const cantidad = parseFloat(cantidadCrypto);
      if (isNaN(cantidad) || cantidad <= 0) {
        Alert.alert('Error', 'Por favor ingrese una cantidad válida');
        return false;
      }
      if (cantidad < 0.01) {
        Alert.alert('Error', 'La cantidad mínima para vender crypto es 0.01 tokens');
        return false;
      }
      if (cantidad > saldoCrypto) {
        Alert.alert('Error', 'Saldo en crypto insuficiente');
        return false;
      }
    }
    return true;
  };

  const handleOperacionCrypto = async () => {
    if (!validateOperacion()) return;

    try {
      setLoading(true);
      
      let response;
      let mensaje;

      if (operacion === 'compra') {
        response = await api.post('/wallet/crypto/buy', {
          montoPesos: parseFloat(montoPesos)
        });
        mensaje = `Solicitud de compra enviada por $${montoPesos}. Recibirás una notificación cuando se complete.`;
      } else {
        response = await api.post('/wallet/crypto/sell', {
          cantidadCrypto: parseFloat(cantidadCrypto)
        });
        mensaje = `Solicitud de venta enviada por ${cantidadCrypto} DC. Recibirás una notificación cuando se complete.`;
      }

      Alert.alert(
        '✅ Solicitud Enviada', 
        mensaje,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error en operación crypto:', error);
      Alert.alert('Error', error.message || 'No se pudo completar la operación');
    } finally {
      setLoading(false);
    }
  };

  const handleMontoRapido = (percentage) => {
    const monto = (saldoPesos * percentage / 100).toFixed(0);
    setMontoPesos(monto);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} /> 
        <Text style={styles.title}>
          {operacion === 'compra' ? 'Comprar DeliverCoin' : 'Vender DeliverCoin'}
        </Text>
        <View style={styles.placeholder} /> 
      </View>


      <ScrollView style={styles.content}>
        {/* Toggle Compra/Venta */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, operacion === 'compra' && styles.toggleButtonActive]}
            onPress={() => setOperacion('compra')}
          >
            <Text style={[styles.toggleButtonText, operacion === 'compra' && styles.toggleButtonTextActive]}>
              💰 Comprar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, operacion === 'venta' && styles.toggleButtonActive]}
            onPress={() => setOperacion('venta')}
          >
            <Text style={[styles.toggleButtonText, operacion === 'venta' && styles.toggleButtonTextActive]}>
              💸 Vender
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información de saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            {operacion === 'compra' ? 'Tu saldo disponible en pesos' : 'Tu saldo disponible en crypto'}
          </Text>
          <Text style={styles.balanceAmount}>
            {operacion === 'compra' ? formatCurrency(saldoPesos) : `${formatCrypto(saldoCrypto)} DC`}
          </Text>
        </View>

        {/* Precio actual de la crypto */}
        <View style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <Text style={styles.cryptoName}>🪙 DeliverCoin (DC)</Text>
          </View>
          <Text style={styles.cryptoPrice}>
            1 DC = {formatCurrency(precioActual)}
          </Text>
        </View>

        {/* Input de operación */}
        <View style={styles.compraContainer}>
          <Text style={styles.label}>
            {operacion === 'compra' ? 'Cantidad a comprar' : 'Cantidad a vender'}
          </Text>
          
          {operacion === 'compra' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.montoInput}
                value={montoPesos}
                onChangeText={setMontoPesos}
                placeholder="0.00"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>DC</Text>
              <TextInput
                style={styles.montoInput}
                value={cantidadCrypto}
                onChangeText={setCantidadCrypto}
                placeholder="0.00"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          )}

          {/* Porcentajes rápidos */}
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageLabel}>Usar porcentaje del saldo:</Text>
            <View style={styles.percentageButtons}>
              {[25, 50, 75, 100].map((percentage) => (
                <TouchableOpacity
                  key={percentage}
                  style={styles.percentageButton}
                  onPress={() => handleMontoRapido(percentage)}
                >
                  <Text style={styles.percentageButtonText}>{percentage}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Resumen de operación */}
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>
            {operacion === 'compra' ? 'Resumen de la compra' : 'Resumen de la venta'}
          </Text>
          
          {operacion === 'compra' ? (
            <>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Monto a invertir:</Text>
                <Text style={styles.resumenValue}>
                  {montoPesos ? formatCurrency(parseFloat(montoPesos)) : '$0'}
                </Text>
              </View>
              
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Precio por DC:</Text>
                <Text style={styles.resumenValue}>{formatCurrency(precioActual)}</Text>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabelTotal}>Recibirás:</Text>
                <Text style={styles.resumenValueTotal}>
                  {!isNaN(parseFloat(cantidadCrypto)) && parseFloat(cantidadCrypto) > 0
                    ? `${formatCrypto(cantidadCrypto)} DC`
                    : '0 DC'}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Cantidad a vender:</Text>
                <Text style={styles.resumenValue}>
                  {cantidadCrypto ? `${formatCrypto(cantidadCrypto)} DC` : '0 DC'}
                </Text>
              </View>
              
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Precio por DC:</Text>
                <Text style={styles.resumenValue}>{formatCurrency(precioActual)}</Text>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabelTotal}>Recibirás:</Text>
                <Text style={styles.resumenValueTotal}>
                  {montoPesos ? formatCurrency(parseFloat(montoPesos)) : '$0'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Botón de operación */}
        <TouchableOpacity 
          style={[
            styles.comprarButton, 
            (operacion === 'compra' && (!montoPesos || loading || parseFloat(montoPesos) > saldoPesos)) && styles.comprarButtonDisabled,
            (operacion === 'venta' && (!cantidadCrypto || loading || parseFloat(cantidadCrypto) > saldoCrypto)) && styles.comprarButtonDisabled
          ]}
          onPress={handleOperacionCrypto}
          disabled={
            (operacion === 'compra' && (!montoPesos || loading || parseFloat(montoPesos) > saldoPesos)) ||
            (operacion === 'venta' && (!cantidadCrypto || loading || parseFloat(cantidadCrypto) > saldoCrypto))
          }
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.comprarButtonText}>
              {operacion === 'compra'
                ? montoPesos && !isNaN(parseFloat(montoPesos)) && parseFloat(montoPesos) > 0
                  ? `Comprar ${formatCrypto(cantidadCrypto)} DC`
                  : 'Comprar DC'
                : cantidadCrypto && !isNaN(parseFloat(cantidadCrypto)) && parseFloat(cantidadCrypto) > 0
                  ? `Vender ${formatCrypto(cantidadCrypto)} DC`
                  : 'Vender DC'}
            </Text>

          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 15,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#f39c12',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshPrice: {
    fontSize: 18,
  },
  cryptoPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 5,
  },
  priceSubtext: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  compraContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#eee',
    marginBottom: 15,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  montoInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 15,
  },
  percentageContainer: {
    marginTop: 10,
  },
  percentageLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  percentageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  percentageButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e91e63',
  },
  percentageButtonText: {
    color: '#e91e63',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resumenCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resumenLabel: {
    fontSize: 16,
    color: '#777',
  },
  resumenValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  resumenLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resumenValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  infoCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  comprarButton: {
    backgroundColor: '#f39c12',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  comprarButtonDisabled: {
    backgroundColor: '#ccc',
  },
  comprarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Crypto;