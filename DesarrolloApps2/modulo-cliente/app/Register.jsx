import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useDispatch, connect } from 'react-redux'; // Importa el hook de dispatch
import { loginSuccess } from '../store/actions/authActions'; // Importa la acción de login
import { api } from '../utils/api';

function Register({ navigation }) { // Recibimos 'navigation' si estamos usando React Navigation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const dispatch = useDispatch();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) {
      return;
    }

    try {
      setIsCheckingEmail(true);
      const response = await api.get(`/users/check-email?email=${email}`);
      if (response.exists) {
        setError('El email ya está registrado');
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setError(''); // Limpiar errores previos
    
    // Esperar 500ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(() => {
      if (validateEmail(text)) {
        checkEmailAvailability(text);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async () => {
    try {
      setError('');

      // Validar formato de email
      if (!validateEmail(email)) {
        setError('Por favor, ingrese un email válido');
        return;
      }

      // Validar contraseña segura
      const passwordError = getPasswordError(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Validar que el nombre no esté vacío
      if (!name.trim()) {
        setError('Por favor, ingrese su nombre');
        return;
      }

      // Validar que el apellido no esté vacío
      if (!surname.trim()) {
        setError('Por favor, ingrese su apellido');
        return;
      }

      // Validar que la dirección no esté vacía
      if (!address.trim()) {
        setError('Por favor, ingrese su dirección');
        return;
      }

      // Validar que el teléfono no esté vacío
      if (!phoneNumber.trim()) {
        setError('Por favor, ingrese su teléfono');
        return;
      }

      const data = await api.post('/auth/register', {
        email: email,
        password: password,
        nombre: name,
        apellido: surname,
        telefono: phoneNumber,
        direccion: address
      });

      const { token, ...userData } = data;
      localStorage.setItem('accessToken', token);
      dispatch(loginSuccess({ ...userData, token }));
      navigation.navigate('Home');
      
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('Error en la petici')) {
        setError('El email ya está registrado');
      } else {
        setError('No es posible conectarse con el servidor');
      }
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error === 'Por favor, ingrese una contraseña') {
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
    // Aquí iría la lógica para navegar a la pantalla de inicio de sesión
    // Usando React Navigation:
    if (navigation) {
      navigation.navigate('Login'); // Asegúrate de que 'Login' esté definido en tus rutas
    } else {
      console.warn('La navegación no está disponible.');
    }
  };

  return (
    <View style={styles.login}>
      <View style={styles.loginHeader}>
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
            type="text"
            placeholder="Nombre..."
            value={name}
            onChangeText={handleNameChange}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            type="text"
            placeholder="Apellido..."
            value={surname}
            onChangeText={handleSurnameChange}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            type="email"
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
            type="password"
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
            type="text"
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  login: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  loginHeader: {
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
    backgroundColor: '#FF6347', // Un color verde para el registro
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
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
export default connect(null, mapDispatchToProps)(Register); // Conectamos el componente a Redux