import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  Modal 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';

const CheckoutProCargarSaldo = () => {
  const navigation = useNavigation();
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [transactionId, setTransactionId] = useState(null);

  const montosRapidos = [500, 1000, 2000, 5000, 10000];

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

  const handleCreatePreference = async () => {
    if (!validateMonto()) return;

    try {
      setLoading(true);

      const response = await api.post('/wallet/create-preference', {
        monto: parseFloat(monto)
      });

      console.log('Preference response:', response);

      // Guardar el transaction ID para verificar después
      setTransactionId(response.transaction_id);
      
      // Usar sandbox_init_point para testing
      const paymentUrl = response.sandbox_init_point || response.init_point;
      setCheckoutUrl(paymentUrl);
      setShowWebView(true);
      
    } catch (error) {
      console.error('Error creating preference:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la preferencia de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    console.log('WebView navigation:', navState.url);
    
    // Detectar cuando el usuario regresa de MercadoPago
    if (navState.url.includes('payment/success') || 
        navState.url.includes('approved')) {
      
      setShowWebView(false);
      handlePaymentSuccess();
      
    } else if (navState.url.includes('payment/failure') || 
               navState.url.includes('rejected')) {
      
      setShowWebView(false);
      Alert.alert('Pago Rechazado', 'El pago fue rechazado. Intenta nuevamente.');
      
    } else if (navState.url.includes('payment/pending')) {
      
      setShowWebView(false);
      Alert.alert(
        'Pago Pendiente', 
        'Tu pago está siendo procesado. Te notificaremos cuando se acredite.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handlePaymentSuccess = () => {
    Alert.alert(
      'Pago Exitoso', 
      `Se procesó tu pago de $${monto}. El saldo se acreditará automáticamente cuando MercadoPago confirme la transacción.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (showWebView) {
    return (
      <Modal visible={showWebView} animationType="slide">
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowWebView(false)}
            >
              <Text style={styles.closeButtonText}>✕ Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Pago MercadoPago</Text>
          </View>
          
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingWebView}>
                <ActivityIndicator size="large" color="#009ee3" />
                <Text>Cargando MercadoPago...</Text>
              </View>
            )}
            style={styles.webView}
          />
        </View>
      </Modal>
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
          <Text style={styles.infoTitle}>💰 Checkout Pro MercadoPago</Text>
          <Text style={styles.infoText}>
            Serás redirigido a MercadoPago para completar el pago de forma segura
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
          <Text style={styles.paymentInfoTitle}>🔒 Checkout Pro</Text>
          <Text style={styles.paymentInfoText}>
            • Checkout oficial de MercadoPago{'\n'}
            • Todos los métodos de pago disponibles{'\n'}
            • Máxima seguridad y confiabilidad{'\n'}
            • Confirmaación automática vía webhook
          </Text>
        </View>

        {/* Información de testing */}
        <View style={styles.testingCard}>
          <Text style={styles.testingTitle}>🧪 Datos para Testing</Text>
          <Text style={styles.testingText}>
            Al llegar a MercadoPago, usa:{'\n'}
            • Tarjeta: 4509 9535 6623 3704{'\n'}
            • CVV: 123{'\n'}
            • Vencimiento: 11/25{'\n'}
            • Nombre: APRO (para aprobar)
          </Text>
        </View>

        {/* Botón continuar */}
        <TouchableOpacity 
          style={[styles.continueButton, (!monto || loading) && styles.continueButtonDisabled]}
          onPress={handleCreatePreference}
          disabled={!monto || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>
              Ir a MercadoPago - {monto ? formatCurrency(parseFloat(monto)) : '$0'}
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
    borderColor: '#009ee3',
    backgroundColor: '#e3f2fd',
  },
  montoRapidoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  montoRapidoSelectedText: {
    color: '#009ee3',
  },
  paymentInfoCard: {
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
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paymentInfoText: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  testingCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  testingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  testingText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
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
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#009ee3',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webViewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
  loadingWebView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
});

export default CheckoutProCargarSaldo;