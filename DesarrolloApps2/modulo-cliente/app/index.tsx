import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Login.jsx';
import Register from './Register.jsx';
import ChangePassword from './ChangePassword.jsx';
import Home from './Home.jsx';
import store from '../store/index.js';
import Profile from './Profile.jsx';
import Orders from './Orders.jsx';
import Cart from './Cart.jsx';
import Product from './Product.jsx';
import Restaurant from './Restaurant.jsx';
import RestaurantCatalogue from './RestaurantCatalogue.jsx';
import Checkout from './Checkout.jsx'
import OrderTracker from './OrderTracker.jsx';
import Wallet from './Wallet.jsx';
//import CheckoutProCargarSaldo from './CheckoutProCargarSaldo.jsx';
import ExternalBrowserCargarSaldo from './ExternalBrowserCargarSaldo.jsx';
import ComprarCrypto from './BuyCrypto.jsx';
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
      
      {/* Pantallas principales */}
      <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio' }} />
      <Stack.Screen name="Profile" component={Profile} options={{ title: 'Perfil' }} />
      <Stack.Screen name="Orders" component={Orders} options={{ title: 'Órdenes' }} />
      <Stack.Screen name="Cart" component={Cart} options={{ title: 'Carrito' }} />
      <Stack.Screen name="Product" component={Product} options={{ title: 'Producto' }} />
      <Stack.Screen name="Restaurant" component={Restaurant} options={{ title: 'Restaurante' }} />
      <Stack.Screen name="RestaurantCatalogue" component={RestaurantCatalogue} options={{ title: 'Catálogo de Restaurantes' }} />
      <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Checkout' }} />
      <Stack.Screen name="OrderTracker" component={OrderTracker} options={{ title: 'Seguimiento de Pedido' }} />
      
      {/* Pantallas de billetera */}
      <Stack.Screen name="Wallet" component={Wallet} options={{ title: 'Mi Billetera' }} />
      <Stack.Screen name="CargarSaldo" component={ExternalBrowserCargarSaldo} options={{ title: 'Cargar Saldo Real' }} />
      <Stack.Screen name="ComprarCrypto" component={ComprarCrypto} options={{ title: 'Comprar Cripto' }} />
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