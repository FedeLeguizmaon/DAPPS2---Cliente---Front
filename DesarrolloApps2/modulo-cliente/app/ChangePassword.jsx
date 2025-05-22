import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { api } from '../utils/api';
import { useNavigation } from '@react-navigation/native'; // Importa el hook de navegación

function ChangePassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isTokenSent, setIsTokenSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigation = useNavigation(); // Usa el hook de navegación

  const validatePassword = (password) => {
    // Mínimo 8 caracteres, al menos una letra mayúscula, una minúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const getPasswordError = (password) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Debe contener al menos una letra mayúscula';
    if (!/[a-z]/.test(password)) return 'Debe contener al menos una letra minúscula';
    if (!/\d/.test(password)) return 'Debe contener al menos un número';
    if (!/[@$!%*?&]/.test(password)) return 'Debe contener al menos un carácter especial (@$!%*?&)';
    return '';
  };

  const handleRequestToken = async () => {
    try {
      setError('');
      if (!email.trim()) {
        setError('Por favor, ingrese su email');
        return;
      }

      setIsLoading(true);
      const response = await api.post('/auth/password/reset-request', { email });
      setIsTokenSent(true);
      Alert.alert('Éxito', 'Se ha enviado un email con las instrucciones para restablecer la contraseña');
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudo enviar el token. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setError('');
      if (!token.trim()) {
        setError('Por favor, ingrese el token recibido');
        return;
      }

      const passwordError = getPasswordError(newPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      setIsLoading(true);
      const response = await api.post('/auth/password/reset-confirm', {
        token,
        newPassword
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudo cambiar la contraseña. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Contraseña</Text>

      {!isTokenSent ? (
        // Pantalla de solicitud de token
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              placeholder="Ingresa tu email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleRequestToken}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Enviar token</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        // Pantalla de cambio de contraseña
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={token}
              onChangeText={(text) => {
                setToken(text);
                setError('');
              }}
              placeholder="Ingresa el token recibido"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setError('');
              }}
              placeholder="Ingresa tu nueva contraseña"
            />
          </View>
          <Text style={styles.passwordRequirements}>
            La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Cambiar Contraseña</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡Éxito!</Text>
            <Text style={styles.modalText}>
              Tu contraseña ha sido cambiada exitosamente. Por favor, inicia sesión con tu nueva contraseña.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#FF6347',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  button: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  passwordRequirements: {
    color: '#666',
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePassword;