import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Switch } from 'react-native';
import { useDispatch, connect } from 'react-redux'; // Importa el hook de dispatch
import { loginSuccess } from '../store/actions/authActions'; // Importa la acción de login
import { api } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importación CORREGIDA
import { useNavigation } from '@react-navigation/native'; // Importa el hook de navegación
import { SocketContext } from './SocketContext'; // ✅ Para reconectar WebSocket

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch(); // Usa el hook de dispatch
  const navigation = useNavigation(); // Usa el hook de navegación
  const socketContext = useContext(SocketContext); // ✅ Para reconectar WebSocket

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    try {
      setError(''); // Limpiar errores previos

      // Validar formato de email
      if (!validateEmail(email)) {
        setError('Por favor, ingrese un email válido');
        return;
      }

      // Validar que la contraseña no esté vacía
      if (!password.trim()) {
        setError('Por favor, ingrese su contraseña');
        return;
      }

      const data = await api.post('/auth/login', {
        email,
        password
      });

      const { token, ...userData } = data;

      // Guardar token en AsyncStorage - CORREGIDO
      try {
        await AsyncStorage.setItem('accessToken', token);
        console.log('Token guardado correctamente');
      } catch (storageError) {
        console.error('Error guardando token:', storageError);
        // El login puede continuar aunque no se guarde el token
      }

      // Si "Recordarme" está activado, guardar las credenciales
      if (rememberMe) {
        try {
          await AsyncStorage.setItem('rememberedEmail', email);
          console.log('Email recordado guardado');
        } catch (storageError) {
          console.error('Error guardando email recordado:', storageError);
        }
      } else {
        // Si no quiere ser recordado, eliminar email guardado
        try {
          await AsyncStorage.removeItem('rememberedEmail');
        } catch (storageError) {
          console.error('Error eliminando email recordado:', storageError);
        }
      }

      dispatch(loginSuccess({ ...userData, token }));
      
      // ✅ La reconexión ahora es manejada automáticamente por SocketContext
      // al detectar el cambio de token. No es necesario forzarla desde aquí.
      // if (socketContext && socketContext.forceReconnect) {
      //   console.log('🔄 Login: Solicitando reconexión del WebSocket...');
      //   setTimeout(() => {
      //     socketContext.forceReconnect();
      //   }, 500);
      // }
      
      navigation.navigate('Home');

    } catch (error) {
      console.error('Error:', error);
      // Verificar si el error es por credenciales inválidas (400, 401, 403)
      if (error.message.includes('Error en la petici')) {
        setError('Combinación de email/password errónea');
      } else {
        setError('No es posible conectarse con el servidor');
      }
    }
  };

  // Función para cargar email recordado al iniciar el componente
  const loadRememberedEmail = async () => {
    try {
      const rememberedEmail = await AsyncStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error cargando email recordado:', error);
    }
  };

  // Cargar email recordado cuando el componente se monta
  React.useEffect(() => {
    loadRememberedEmail();
  }, []);

  const handleEmailChange = (text) => {
    setEmail(text);
    // Limpiar error de formato de email si el usuario está escribiendo
    if (error === 'Por favor, ingrese un email válido') {
      setError('');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    // Limpiar error de contraseña vacía si el usuario está escribiendo
    if (error === 'Por favor, ingrese su contraseña') {
      setError('');
    }
  };

  const handleRememberMeChange = (value) => {
    setRememberMe(value);
    // Si desactiva "recordarme", eliminar email guardado
    if (!value) {
      AsyncStorage.removeItem('rememberedEmail').catch(error => {
        console.error('Error eliminando email recordado:', error);
      });
    }
  };

  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ChangePassword');
    } else {
      alert('La navegacion no esta disponible');
    }
  };

  const handleRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    } else {
      alert('La navegacion no esta disponible');
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
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.registerText}>
          ¿No tienes una cuenta?
          <Text style={styles.registerLink} onPress={handleRegister}> Regístrate</Text>
        </Text>
      </View>
      <View style={styles.form}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
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
        <View style={styles.recpassContainer}>
          <View style={styles.rememberMe}>
            <Switch
              value={rememberMe}
              onValueChange={handleRememberMeChange}
            />
            <Text style={styles.rememberMeLabel}>Recordarme</Text>
          </View>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
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
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    color: '#FF6347',
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
  recpassContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  forgotPassword: {
    color: '#FF6347',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF6347',
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
});

const mapDispatchToProps = (dispatch) => {
  return {
    loginSuccess: (userData) => dispatch(loginSuccess(userData)),
  };
}

export default connect(null, mapDispatchToProps)(Login);