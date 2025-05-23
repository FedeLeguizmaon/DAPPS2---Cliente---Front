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

const BuyCrypto = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { saldoPesos = 0, precioCrypto = 25 } = route.params || {};

  const [montoPesos, setMontoPesos] = useState('');
  const [cantidadCrypto, setCantidadCrypto] = useState('0');
  const [loading, setLoading] = useState(false);
  const [precioActual, setPrecioActual] = useState(precioCrypto);

  useEffect(() => {
    loadPrecioCrypto();
  }, []);

  useEffect(() => {
    calculateCrypto();
  }, [montoPesos, precioActual]);

  const loadPrecioCrypto = async () => {
    try {
      const response = await api.get('/wallet/precio-crypto');
      setPrecioActual(response.precio);
    } catch (error) {
      console.error('Error loading crypto price:', error);
    }
  };

  const calculateCrypto = () => {
    const monto = parseFloat(montoPesos);
    if (!isNaN(monto) && monto > 0 && precioActual > 0) {
      const crypto = monto / precioActual;
      setCantidadCrypto(crypto.toFixed(4));
    } else {
      setCantidadCrypto('0');
    }
  };

  const validateCompra = () => {
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
      Alert.alert('Error', 'Saldo insuficiente');
      return false;
    }
    return true;
  };

  const handleComprarCrypto = async () => {
    if (!validateCompra()) return;

    try {
      setLoading(true);
      
      const response = await api.post('/wallet/comprar-crypto', {
        montoPesos: parseFloat(montoPesos)
      });

      Alert.alert(
        '🎉 Compra Exitosa', 
        `Has comprado ${response.cantidadCrypto} G7Coin por $${montoPesos}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error al comprar crypto:', error);
      Alert.alert('Error', error.message || 'No se pudo completar la compra');
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
    return parseFloat(amount).toFixed(4);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} /> 
        <Text style={styles.title}>Comprar G7Coin</Text>
        <View style={styles.placeholder} /> 
      </View>


      <ScrollView style={styles.content}>
        {/* Información de saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Tu saldo disponible en pesos</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(saldoPesos)}</Text>
        </View>

        {/* Precio actual de la crypto */}
        <View style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <Text style={styles.cryptoName}>🪙 G7Coin (G7C)</Text>
            <TouchableOpacity onPress={loadPrecioCrypto}>
              <Text style={styles.refreshPrice}>🔄</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cryptoPrice}>
            1 G7C = {formatCurrency(precioActual)}
          </Text>
        </View>

        {/* Input de compra */}
        <View style={styles.compraContainer}>
          <Text style={styles.label}>Monto a invertir</Text>
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

        {/* Resumen de compra */}
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>Resumen de la compra</Text>
          
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Monto a invertir:</Text>
            <Text style={styles.resumenValue}>
              {montoPesos ? formatCurrency(parseFloat(montoPesos)) : '$0'}
            </Text>
          </View>
          
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Precio por G7C:</Text>
            <Text style={styles.resumenValue}>{formatCurrency(precioActual)}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabelTotal}>Recibirás:</Text>
            <Text style={styles.resumenValueTotal}>
              {formatCrypto(cantidadCrypto)} G7C
            </Text>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Información importante</Text>
          <Text style={styles.infoText}>
            • En la implementación real, se conectará con el módulo de blockchain
          </Text>
        </View>

        {/* Botón de comprar */}
        <TouchableOpacity 
          style={[
            styles.comprarButton, 
            (!montoPesos || loading || parseFloat(montoPesos) > saldoPesos) && styles.comprarButtonDisabled
          ]}
          onPress={handleComprarCrypto}
          disabled={!montoPesos || loading || parseFloat(montoPesos) > saldoPesos}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.comprarButtonText}>
              Comprar {formatCrypto(cantidadCrypto)} G7C
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

export default BuyCrypto;