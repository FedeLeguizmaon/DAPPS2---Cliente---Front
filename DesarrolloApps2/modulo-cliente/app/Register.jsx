import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useDispatch, connect } from 'react-redux'; // Importa el hook de dispatch
import { loginSuccess } from '../store/actions/authActions'; // Importa la acción de login

function Register({ navigation }) { // Recibimos 'navigation' si estamos usando React Navigation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    console.log('Enviando formulario de registro', email, password, phoneNumber, name, surname, address);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          nombre: name,
          apellido: surname,
          telefono: phoneNumber,
          direccion: address
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        setMessage(data.message || 'Error en el registro');
        throw new Error(data.message || 'Error en el registro');
      }
      
      // Si el registro es exitoso
      dispatch(loginSuccess(data));
      navigation.navigate('Home');
      
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.message || 'Error al conectar con el servidor');
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            type="text"
            placeholder="Nombre..."
            value={name}
            onChangeText={(text) => setName(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            type="text"
            placeholder="Apellido..."
            value={surname}
            onChangeText={(text) => setSurname(text)}
          />
        </View>
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            type="text"
            placeholder="Dirección..."
            value={address}
            onChangeText={(text) => setAddress(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Teléfono..."
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
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
});

const mapDispatchToProps = (dispatch) => {
  return {
    loginSuccess: (userData) => dispatch(loginSuccess(userData)),
  };
}
export default connect(null, mapDispatchToProps)(Register); // Conectamos el componente a Redux