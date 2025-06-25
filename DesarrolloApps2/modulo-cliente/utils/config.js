// config.js - Configuración para múltiples entornos
import { Platform } from 'react-native';

// 🎯 CONFIGURACIÓN PRINCIPAL - Cambia esta variable para alternar entre entornos
const USE_PRODUCTION_API = true; // true = Railway, false = Local

// URLs de los diferentes entornos
const API_URLS = {
  // Servidor en Railway (Producción)
  production: 'https://client-back-production.up.railway.app/api',
  
  // Servidor local (Desarrollo)
  local: {
    android: 'http://10.0.2.2:8080/api',  // Android Emulator
    ios: 'http://localhost:8080/api',      // iOS Simulator
    web: 'http://localhost:8080/api'       // Web
  }
};

const getApiUrl = () => {
  // Si está configurado para usar producción, siempre usa Railway
  if (USE_PRODUCTION_API) {
    console.log('🌐 Usando servidor de Railway (Producción)');
    return API_URLS.production;
  }

  // Para desarrollo local
  console.log('🏠 Usando servidor local (Desarrollo)');
  
  if (Platform.OS === 'android') {
    return API_URLS.local.android;
  } else if (Platform.OS === 'ios') {
    return API_URLS.local.ios;
  } else {
    // Para web o cualquier otra plataforma
    return API_URLS.local.web;
  }
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: USE_PRODUCTION_API ? 15000 : 10000, // Más tiempo para Railway
  USE_PRODUCTION: USE_PRODUCTION_API,
  CURRENT_ENV: USE_PRODUCTION_API ? 'production' : 'local'
};

// Configuración adicional para debugging
export const DEBUG_CONFIG = {
  ENABLE_LOGS: __DEV__,
  LOG_REQUESTS: __DEV__,
  LOG_RESPONSES: __DEV__,
  SHOW_NETWORK_DETAILS: __DEV__
};

// Función para cambiar de entorno dinámicamente (opcional)
export const switchEnvironment = (useProduction = true) => {
  console.log(`🔄 Cambiando a entorno: ${useProduction ? 'Producción (Railway)' : 'Local'}`);
  // Nota: Esto requeriría reiniciar la app para tomar efecto
  // o implementar un estado global para manejar el cambio
};

// Función para mostrar la configuración actual
export const showCurrentConfig = () => {
  console.log('🔧 === CONFIGURACIÓN ACTUAL ===');
  console.log('📱 Plataforma:', Platform.OS);
  console.log('🌐 URL Base:', API_CONFIG.BASE_URL);
  console.log('🏢 Entorno:', API_CONFIG.CURRENT_ENV);
  console.log('⏰ Timeout:', API_CONFIG.TIMEOUT + 'ms');
  console.log('🛠️ Es desarrollo:', __DEV__);
  
  return API_CONFIG;
};

// URLs de WebSocket para diferentes entornos
const WEBSOCKET_URLS = {
  // Servidor en Railway (Producción)
  production: 'wss://client-back-production.up.railway.app/ws/order-tracking',
  
  // Servidor local (Desarrollo)
  local: {
    android: 'ws://10.0.2.2:8080/ws/order-tracking',  // Android Emulator
    ios: 'ws://localhost:8080/ws/order-tracking',      // iOS Simulator
    web: 'ws://localhost:8080/ws/order-tracking'       // Web
  }
};

const getWebSocketBaseUrl = () => {
  // Si está configurado para usar producción, siempre usa Railway
  if (USE_PRODUCTION_API) {
    console.log('🔌 Usando WebSocket de Railway (Producción)');
    return WEBSOCKET_URLS.production;
  }

  // Para desarrollo local
  console.log('🔌 Usando WebSocket local (Desarrollo)');
  
  if (Platform.OS === 'android') {
    return WEBSOCKET_URLS.local.android;
  } else if (Platform.OS === 'ios') {
    return WEBSOCKET_URLS.local.ios;
  } else {
    // Para web o cualquier otra plataforma
    return WEBSOCKET_URLS.local.web;
  }
};

// Función para construir la URL del WebSocket con autenticación
export const getWebSocketUrl = (userId, token) => {
  const baseUrl = getWebSocketBaseUrl();
  
  // Construir URL con parámetros de autenticación
  const wsUrl = `${baseUrl}?userId=${userId}&token=${encodeURIComponent(token)}`;
  
  return wsUrl;
};

// Función para mostrar la configuración del WebSocket (debugging)
export const showWebSocketConfig = () => {
  console.log('🔌 === CONFIGURACIÓN WEBSOCKET ===');
  console.log('📱 Plataforma:', Platform.OS);
  console.log('🌐 URL Base WS:', getWebSocketBaseUrl());
  console.log('🏢 Entorno:', API_CONFIG.CURRENT_ENV);
  console.log('🔐 Autenticación: JWT via query params');
  
  return {
    baseUrl: getWebSocketBaseUrl(),
    environment: API_CONFIG.CURRENT_ENV,
    platform: Platform.OS
  };
};

// Configuración adicional para WebSocket
export const WEBSOCKET_CONFIG = {
  BASE_URL: getWebSocketBaseUrl(),
  RECONNECT_INTERVAL: 5000, // 5 segundos
  MAX_RECONNECT_ATTEMPTS: 5,
  PING_INTERVAL: 30000, // 30 segundos
  USE_PRODUCTION: USE_PRODUCTION_API
};