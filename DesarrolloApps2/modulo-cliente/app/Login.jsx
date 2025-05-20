import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Switch } from 'react-native';
import { useDispatch, connect } from 'react-redux'; // Importa el hook de dispatch
import { loginSuccess } from '../store/actions/authActions'; // Importa la acción de login
import { api } from '../utils/api';

function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch(); // Usa el hook de dispatch

  const handleSubmit = async () => {
    try {
      const data = await api.post('/auth/login', {
        email,
        password
      });

      // Si el login es exitoso
      const { token, ...userData } = data;
      
      // Guardamos el token en localStorage para uso futuro
      localStorage.setItem('accessToken', token);
      
      // Disparamos la acción de login con los datos del usuario
      dispatch(loginSuccess({ ...userData, token }));
      navigation.navigate('Home');
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al conectar con el servidor');
    }
  };
  


  const handleRememberMeChange = (value) => {
    setRememberMe(value);
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            type="email"
            placeholder="Email..."
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            type="password"
            placeholder="Contraseña..."
            value={password}
            onChangeText={(text) => setPassword(text)}
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
});

const mapDispatchToProps = (dispatch) => {
  return {
    loginSuccess: (userData) => dispatch(loginSuccess(userData)),
  };
}
export default connect(null, mapDispatchToProps)(Login); // Conecta el componente a Redux