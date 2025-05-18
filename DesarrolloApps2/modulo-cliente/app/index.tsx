import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Login.jsx';
import Register from './Register.jsx';
import ChangePassword from './ChangePassword.jsx';
import Home from './Home.jsx';
import store from '../store/index.js';
import Profile from './Profile.jsx';
import { Provider, useSelector } from 'react-redux';

const Stack = createNativeStackNavigator();

// Define RootState here if not exported from store
type RootState = ReturnType<typeof store.getState>;

function AppNavigator() {
  const user = useSelector((state: RootState) => state.auth.user);
  const initialRouteName = user ? 'Home' : 'Login';

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      {/* Pantallas de autenticación */}
      <Stack.Screen name="Login" component={Login} options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Registrarse' }} />
      <Stack.Screen name='ChangePassword' component={ChangePassword} options={{ title: 'Change Password' }} />
      <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio' }} />
      <Stack.Screen name="Profile" component={Profile} options={{ title: 'Perfil' }} />
    </Stack.Navigator>
  );
}

export default function Index() {
  return (
    <Provider store={store}>
        <AppNavigator />
    </Provider>
  );
}