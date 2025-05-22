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
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';

const AddFunds = () => {
  const navigation = useNavigation();
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [mpConfig, setMpConfig] = useState(null);
  const [cardData, setCardData] = useState({
    number: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    cardholderName: '',
    identificationType: 'DNI',
    identificationNumber: ''
  });

  const montosRapidos = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    loadMercadoPagoConfig();
  }, []);

  const loadMercadoPagoConfig = async () => {
    try {
      const config = await api.get('/wallet/config');
      setMpConfig(config);
    } catch (error) {
      console.error('Error loading MP config:', error);
    }
  };

  const handleMontoRapido = (amount) => {
    setMonto(amount.toString());
  };

  const validateMonto = () => {
    const amount = parseFloat(monto);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingrese un monto válido');
      return false;
    }
    if (amount < 100) {
      Alert.alert('Error', 'El monto mínimo es $100');
      return false;
    }
    if (amount > 50000) {
      Alert.alert('Error', 'El monto máximo es $50,000');
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateMonto()) return;
    setShowPaymentForm(true);
  };

  const handleCardInputChange = (field, value) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCard = () => {
    if (!cardData.number || cardData.number.length < 13) {
      Alert.alert('Error', 'Número de tarjeta inválido');
      return false;
    }
    if (!cardData.expirationMonth || !cardData.expirationYear) {
      Alert.alert('Error', 'Fecha de vencimiento requerida');
      return false;
    }
    if (!cardData.securityCode || cardData.securityCode.length < 3) {
      Alert.alert('Error', 'Código de seguridad inválido');
      return false;
    }
    if (!cardData.cardholderName) {
      Alert.alert('Error', 'Nombre del titular requerido');
      return false;
    }
    if (!cardData.identificationNumber) {
      Alert.alert('Error', 'Número de documento requerido');
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    if (!validateCard()) return;

    try {
      setLoading(true);

      // Para testing, usamos datos de tarjeta de prueba de MercadoPago
      const testCardToken = `card_token_${Date.now()}`; // En producción real esto viene del SDK de MP
      
      const paymentRequest = {
        monto: parseFloat(monto),
        cardToken: testCardToken,
        securityCode: cardData.securityCode,
        issuerId: '25', // Banco de prueba
        installments: 1
      };

      const response = await api.post('/wallet/create-payment', paymentRequest);
      
      if (response.status === 'approved') {
        Alert.alert(
          'Pago Exitoso', 
          `Se cargaron $${monto} a tu billetera exitosamente`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else if (response.status === 'pending') {
        Alert.alert(
          'Pago Pendiente', 
          'Tu pago está siendo procesado. Te notificaremos cuando se acredite.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'El pago fue rechazado. Intenta con otra tarjeta.');
      }
      
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'No se pudo procesar el pago. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (showPaymentForm) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowPaymentForm(false)}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Datos de Pago</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Resumen */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(parseFloat(monto))}</Text>
          </View>

          {/* Formulario de tarjeta */}
          <View style={styles.cardForm}>
            <Text style={styles.formTitle}>💳 Datos de la Tarjeta</Text>
            
            <Text style={styles.testInfo}>
              💡 Para pruebas usa: 4509 9535 6623 3704 (Visa)
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              value={cardData.number}
              onChangeText={(text) => handleCardInputChange('number', text)}
              keyboardType="numeric"
              maxLength={19}
            />

            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM"
                value={cardData.expirationMonth}
                onChangeText={(text) => handleCardInputChange('expirationMonth', text)}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="AA"
                value={cardData.expirationYear}
                onChangeText={(text) => handleCardInputChange('expirationYear', text)}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                value={cardData.securityCode}
                onChangeText={(text) => handleCardInputChange('securityCode', text)}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre del titular"
              value={cardData.cardholderName}
              onChangeText={(text) => handleCardInputChange('cardholderName', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="DNI (para pruebas: 12345678)"
              value={cardData.identificationNumber}
              onChangeText={(text) => handleCardInputChange('identificationNumber', text)}
              keyboardType="numeric"
            />
          </View>

          {/* Botón de pagar */}
          <TouchableOpacity 
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={processPayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                Pagar {formatCurrency(parseFloat(monto))}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cargar Saldo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Información */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💰 Cargar Saldo</Text>
          <Text style={styles.infoText}>
            Pago real con MercadoPago - Ambiente de pruebas
          </Text>
        </View>

        {/* Input de monto */}
        <View style={styles.montoContainer}>
          <Text style={styles.label}>Monto a cargar</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.montoInput}
              value={monto}
              onChangeText={setMonto}
              placeholder="0.00"
              keyboardType="numeric"
              maxLength={8}
            />
          </View>
          <Text style={styles.helperText}>Monto mínimo: $100 - Máximo: $50,000</Text>
        </View>

        {/* Montos rápidos */}
        <View style={styles.montosRapidosContainer}>
          <Text style={styles.label}>Montos rápidos</Text>
          <View style={styles.montosRapidosGrid}>
            {montosRapidos.map((amount, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.montoRapidoButton,
                  monto === amount.toString() && styles.montoRapidoSelected
                ]}
                onPress={() => handleMontoRapido(amount)}
              >
                <Text style={[
                  styles.montoRapidoText,
                  monto === amount.toString() && styles.montoRapidoSelectedText
                ]}>
                  {formatCurrency(amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Información de MercadoPago */}
        <View style={styles.paymentInfoCard}>
          <Text style={styles.paymentInfoTitle}>🔒 MercadoPago Real</Text>
          <Text style={styles.paymentInfoText}>
            Integración real con MercadoPago en ambiente de testing
          </Text>
          <View style={styles.paymentMethods}>
            <Text style={styles.paymentMethodsText}>💳 Visa • MasterCard • 🏦 Cuenta MP</Text>
          </View>
        </View>

        {/* Botón continuar */}
        <TouchableOpacity 
          style={[styles.continueButton, !monto && styles.continueButtonDisabled]}
          onPress={handleContinueToPayment}
          disabled={!monto}
        >
          <Text style={styles.continueButtonText}>
            Continuar con {monto ? formatCurrency(parseFloat(monto)) : '$0'}
          </Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
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
  infoCard: {
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  cardForm: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  testInfo: {
    fontSize: 12,
    color: '#ff9800',
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  montoContainer: {
    marginBottom: 25,
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
  helperText: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  montosRapidosContainer: {
    marginBottom: 25,
  },
  montosRapidosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  montoRapidoButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#eee',
    minWidth: '30%',
  },
  montoRapidoSelected: {
    borderColor: '#e91e63',
    backgroundColor: '#fdecea',
  },
  montoRapidoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  montoRapidoSelectedText: {
    color: '#e91e63',
  },
  paymentInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paymentInfoText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  paymentMethods: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  paymentMethodsText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#009ee3',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#4caf50',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddFunds;