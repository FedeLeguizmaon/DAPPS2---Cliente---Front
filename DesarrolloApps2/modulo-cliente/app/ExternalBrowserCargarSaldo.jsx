import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  Linking 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

const ExternalBrowserCargarSaldo = () => {
  const navigation = useNavigation();
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);

  const montosRapidos = [5000, 10000, 20000, 50000, 75000, 100000];
  const MONTO_MINIMO = 100;
  const MONTO_MAXIMO = 100000;

  const handleMontoRapido = (amount) => {
    setMonto(amount.toString());
  };

  // Función para validar si el monto es válido
  const isMontoValido = () => {
    const amount = parseFloat(monto);
    return !isNaN(amount) && amount >= MONTO_MINIMO && amount <= MONTO_MAXIMO;
  };

  const validateMonto = () => {
    const amount = parseFloat(monto);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingrese un monto válido');
      return false;
    }
    if (amount < MONTO_MINIMO) {
      Alert.alert('Error', `El monto mínimo es $${MONTO_MINIMO}`);
      return false;
    }
    if (amount > MONTO_MAXIMO) {
      Alert.alert('Error', `El monto máximo es $${MONTO_MAXIMO.toLocaleString()}`);
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

      if (response.status === 'error') {
        throw new Error(response.error);
      }

      // Usar init_point para testing (no sandbox_init_point)
      const paymentUrl = response.init_point;
      
      if (!paymentUrl) {
        throw new Error('No se pudo obtener la URL de pago de MercadoPago');
      }

      console.log('Payment URL:', paymentUrl);
      
      // Intentar abrir automáticamente
      try {
        const supported = await Linking.canOpenURL(paymentUrl);
        console.log('Can open URL:', supported);
        
        if (supported) {
          await Linking.openURL(paymentUrl);
          console.log('URL opened successfully');
          
          // Mostrar mensaje de éxito y regresar a wallet
          Alert.alert(
            'Redirigido a MercadoPago',
            'Completa el pago en tu navegador. Una vez finalizado, regresa a la app para ver tu saldo actualizado.',
            [{ 
              text: 'Entendido', 
              onPress: () => navigation.navigate('Wallet')
            }]
          );
        } else {
          // Si no puede abrir automáticamente, mostrar la URL
          throw new Error('Cannot open URL automatically');
        }
      } catch (error) {
        console.error('Error opening URL automatically:', error);
        
        // Fallback: mostrar la URL para copiar manualmente
        Alert.alert(
          'Ir a MercadoPago', 
          `No se pudo abrir automáticamente. Copia esta URL en tu navegador:\n\n${paymentUrl}`,
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Copiar URL',
              onPress: () => {
                // Mostrar la URL completa
                Alert.alert('URL de Pago', paymentUrl, [
                  { text: 'Cerrar' },
                  { 
                    text: 'Ir a Wallet',
                    onPress: () => navigation.navigate('Wallet')
                  }
                ]);
              }
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error creating preference:', error);
      
      let errorMessage = 'No se pudo crear la preferencia de pago';
      
      if (error.message.includes('invalid_token')) {
        errorMessage = 'Error de configuración de MercadoPago. Verificar credenciales de testing.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
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

  // Función para obtener el color del texto helper basado en la validación
  const getHelperTextStyle = () => {
    if (!monto) return styles.helperText;
    
    const amount = parseFloat(monto);
    if (isNaN(amount)) return styles.helperTextError;
    
    if (amount < MONTO_MINIMO || amount > MONTO_MAXIMO) {
      return styles.helperTextError;
    }
    
    return styles.helperTextSuccess;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} /> 
        <Text style={styles.title}>Cargar Saldo</Text>
        <View style={styles.placeholder} /> 
      </View>

      <ScrollView style={styles.content}>
        {/* Información */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💰 MercadoPago </Text>
          <Text style={styles.infoText}>
            Se abrirá tu navegador para completar el pago de forma segura en MercadoPago
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
          <Text style={getHelperTextStyle()}>
            Monto mínimo: ${MONTO_MINIMO} - Máximo: ${MONTO_MAXIMO.toLocaleString()}
          </Text>
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

        {/* Instrucciones */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Instrucciones</Text>
          <Text style={styles.instructionsText}>
            1. Selecciona el monto y toca &quot;Ir a MercadoPago&quot;{'\n'}
            2. Se abrirá tu navegador con el checkout{'\n'}
            3. Completa el pago con los datos de prueba{'\n'}
            4. Regresa a la app para ver tu saldo actualizado{'\n'}
            5. El saldo se acredita automáticamente
          </Text>
        </View>

        {/* Botón continuar */}
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            (!isMontoValido() || loading) && styles.continueButtonDisabled
          ]}
          onPress={handleCreatePreference}
          disabled={!isMontoValido() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>
              Ir a MercadoPago - {monto && isMontoValido() ? formatCurrency(parseFloat(monto)) : '$0'}
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
  helperTextError: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 5,
    fontWeight: '500',
  },
  helperTextSuccess: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 5,
    fontWeight: '500',
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
  instructionsCard: {
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
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  testingCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
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
});

export default ExternalBrowserCargarSaldo;