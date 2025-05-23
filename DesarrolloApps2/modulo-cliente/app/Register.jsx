import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useDispatch, connect } from 'react-redux';
import { loginSuccess } from '../store/actions/authActions';
import { api } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importación CORREGIDA
import { useNavigation } from '@react-navigation/native'; // Importa el hook de navegación

function Register() {
  // Recibimos 'navigation' si estamos usando React Navigation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const navigation = useNavigation(); // Usa el hook de navegación

  const dispatch = useDispatch();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
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

  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) {
      return;
    }

    try {
      console.log('🔍 Verificando disponibilidad del email:', email);
      setIsCheckingEmail(true);
      setError(''); // Limpiar errores previos

      const response = await api.get(`/users/check-email?email=${email}`);
      console.log('📧 Respuesta de verificación de email:', response);

      if (response.exists) {
        setError('El email ya está registrado');
      } else {
        console.log('✅ Email disponible');
      }
    } catch (error) {
      console.error('💥 Error al verificar email:', error);
      // No mostrar error al usuario para la verificación de email
      // Solo loggearlo para debugging
      if (error.message.includes('Network request failed')) {
        console.log('⚠️ No se pudo verificar email - servidor no responde');
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setError('');

    // Cancelar timeout anterior si existe
    if (window.emailCheckTimeout) {
      clearTimeout(window.emailCheckTimeout);
    }

    // Crear nuevo timeout
    window.emailCheckTimeout = setTimeout(() => {
      if (validateEmail(text)) {
        checkEmailAvailability(text);
      }
    }, 500);
  };

  // Función para guardar datos del usuario localmente
  const saveUserDataLocally = async (userData) => {
    try {
      console.log('💾 Guardando datos del usuario:', userData);

      // Guardar datos completos del usuario
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Guardar token por separado para fácil acceso
      if (userData.token) {
        await AsyncStorage.setItem('accessToken', userData.token);
        console.log('🔑 Token guardado correctamente');
      }

      // Guardar email para recordar usuario
      await AsyncStorage.setItem('userEmail', userData.email);

      // Guardar perfil del usuario
      const userProfile = {
        name: userData.nombre || name,
        surname: userData.apellido || surname,
        email: userData.email || email,
        phone: userData.telefono || phoneNumber,
        address: userData.direccion || address,
        registrationDate: new Date().toISOString()
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));

      console.log('✅ Datos del usuario guardados localmente');
      Alert.alert('Éxito', 'Usuario registrado y datos guardados localmente');

    } catch (error) {
      console.error('💥 Error guardando datos localmente:', error);
      Alert.alert('Advertencia', 'Usuario registrado pero no se pudieron guardar los datos localmente');
    }
  };

  // Función para cargar datos guardados (útil para debugging)
  const loadSavedUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const userProfile = await AsyncStorage.getItem('userProfile');
      const accessToken = await AsyncStorage.getItem('accessToken');

      console.log('📱 Datos guardados:');
      console.log('UserData:', userData ? JSON.parse(userData) : 'No hay datos');
      console.log('UserProfile:', userProfile ? JSON.parse(userProfile) : 'No hay perfil');
      console.log('AccessToken:', accessToken || 'No hay token');

      Alert.alert(
        'Datos Guardados',
        `UserData: ${userData ? 'Sí' : 'No'}\nUserProfile: ${userProfile ? 'Sí' : 'No'}\nToken: ${accessToken ? 'Sí' : 'No'}`
      );
    } catch (error) {
      console.error('💥 Error cargando datos:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      console.log('🚀 Iniciando proceso de registro...');

      // Validar formato de email
      if (!validateEmail(email)) {
        const errorMsg = 'Por favor, ingrese un email válido';
        setError(errorMsg);
        console.log('❌ Error de validación:', errorMsg);
        return;
      }

      // Validar contraseña segura
      const passwordError = getPasswordError(password);
      if (passwordError) {
        setError(passwordError);
        console.log('❌ Error de contraseña:', passwordError);
        return;
      }

      // Validar campos requeridos
      if (!name.trim()) {
        const errorMsg = 'Por favor, ingrese su nombre';
        setError(errorMsg);
        console.log('❌ Error de validación:', errorMsg);
        return;
      }

      if (!surname.trim()) {
        const errorMsg = 'Por favor, ingrese su apellido';
        setError(errorMsg);
        console.log('❌ Error de validación:', errorMsg);
        return;
      }

      if (!address.trim()) {
        const errorMsg = 'Por favor, ingrese su dirección';
        setError(errorMsg);
        console.log('❌ Error de validación:', errorMsg);
        return;
      }

      if (!phoneNumber.trim()) {
        const errorMsg = 'Por favor, ingrese su teléfono';
        setError(errorMsg);
        console.log('❌ Error de validación:', errorMsg);
        return;
      }

      console.log('✅ Todas las validaciones pasaron');

      // Preparar datos para el registro
      const registrationData = {
        email: email.trim(),
        password: password,
        nombre: name.trim(),
        apellido: surname.trim(),
        telefono: phoneNumber.trim(),
        direccion: address.trim()
      };

      console.log('📦 Datos de registro:', {
        email: registrationData.email,
        nombre: registrationData.nombre,
        apellido: registrationData.apellido,
        telefono: registrationData.telefono,
        direccion: registrationData.direccion
        // No mostrar password en los logs
      });

      console.log('🌐 Enviando petición de registro...');

      // Realizar registro en el servidor
      const response = await api.post('/auth/register', registrationData);

      console.log('🎉 Registro exitoso:', response);

      const { token, ...userData } = response;

      // Preparar datos completos del usuario
      const completeUserData = {
        ...userData,
        token,
        email: registrationData.email,
        nombre: registrationData.nombre,
        apellido: registrationData.apellido,
        telefono: registrationData.telefono,
        direccion: registrationData.direccion
      };

      // Guardar datos localmente
      await saveUserDataLocally(completeUserData);

      // Dispatch para Redux
      dispatch(loginSuccess(completeUserData));

      console.log('🏠 Navegando a Home...');
      // Navegar a Home
      navigation.navigate('Home');

    } catch (error) {
      console.error('💥 Error completo en registro:', error);
      console.error('💥 Tipo de error:', error.name);
      console.error('💥 Mensaje:', error.message);

      if (error.message === 'Network request failed') {
        setError(
          'No se pudo conectar con el servidor.\n\n' +
          'Verifica que:\n' +
          '• El servidor esté corriendo\n' +
          '• Tengas conexión a internet\n' +
          '• La configuración de la API sea correcta'
        );
      } else if (error.message.includes('Error en la petici')) {
        setError('El email ya está registrado');
      } else if (error.message.includes('timeout')) {
        setError('La petición tardó demasiado tiempo. Intenta nuevamente.');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error && error.includes('contraseña')) {
      setError('');
    }
  };

  const handleNameChange = (text) => {
    setName(text);
    if (error === 'Por favor, ingrese su nombre') {
      setError('');
    }
  };

  const handleSurnameChange = (text) => {
    setSurname(text);
    if (error === 'Por favor, ingrese su apellido') {
      setError('');
    }
  };

  const handleAddressChange = (text) => {
    setAddress(text);
    if (error === 'Por favor, ingrese su dirección') {
      setError('');
    }
  };

  const handlePhoneChange = (text) => {
    setPhoneNumber(text);
    if (error === 'Por favor, ingrese su teléfono') {
      setError('');
    }
  };

  const handleLoginNavigation = () => {
    if (navigation) {
      navigation.navigate('Login');
    } else {
      console.warn('La navegación no está disponible.');
    }
  };

  return (
    <View style={styles.register}>
      <View style={styles.registerHeader}>
        <Image
          source={{ uri: 'https://static.vecteezy.com/system/resources/previews/009/267/561/original/user-icon-design-free-png.png' }}
          style={styles.userIcon}
          resizeMode='contain'
        />
        <Text style={styles.title}>Registrarse</Text>
        <Text style={styles.loginText}>
          ¿Ya tenés una cuenta?
          <Text style={styles.loginLink} onPress={handleLoginNavigation}> Iniciá sesión</Text>
        </Text>
      </View>
      <View style={styles.form}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
        {isCheckingEmail && (
          <Text style={styles.checkingText}>Verificando disponibilidad del email...</Text>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Nombre..."
            value={name}
            onChangeText={handleNameChange}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Apellido..."
            value={surname}
            onChangeText={handleSurnameChange}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Email..."
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Contraseña..."
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />
        </View>
        <Text style={styles.passwordRequirements}>
          La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Dirección..."
            value={address}
            onChangeText={handleAddressChange}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Teléfono..."
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Botón para debugging - remover en producción */}
        <TouchableOpacity style={styles.debugButton} onPress={loadSavedUserData}>
          <Text style={styles.debugButtonText}>Ver Datos Guardados (Debug)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  register: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  registerHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userIcon: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    color: 'blue',
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  checkingText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  passwordRequirements: {
    color: '#666',
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    loginSuccess: (userData) => dispatch(loginSuccess(userData)),
  };
}

export default connect(null, mapDispatchToProps)(Register);