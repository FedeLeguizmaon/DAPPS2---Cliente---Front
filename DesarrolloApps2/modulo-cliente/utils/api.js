import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// CONFIGURACIÓN ESPECÍFICA PARA EXPO + ANDROID EMULATOR
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080/api'  // Para Android Emulator (10.0.2.2 es el alias de localhost)
  : 'http://localhost:8080/api'; // Para iOS Simulator

console.log('🔧 API configurada para:', Platform.OS);
console.log('🌐 URL base:', API_BASE_URL);

const getHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    if (__DEV__) {
      console.log('📝 Headers preparados:', {
        'Content-Type': headers['Content-Type'],
        'Accept': headers['Accept'],
        'Authorization': token ? 'Bearer [TOKEN_PRESENTE]' : 'No autorizado'
      });
    }

    return headers;
  } catch (error) {
    console.error('💥 Error obteniendo headers:', error);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getHeaders();

  if (__DEV__) {
    console.log('🚀 === NUEVA PETICIÓN API ===');
    console.log('🌐 URL completa:', url);
    console.log('🔧 Método:', options.method || 'GET');
    console.log('📱 Plataforma:', Platform.OS);

    if (options.body) {
      console.log('📦 Body enviado:', options.body);
    }
  }

  console.log('Making API request:', {
    url,
    method: options.method || 'GET',
    headers: {
      ...headers,
      Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 20)}...` : 'No auth'
    }
  });

  try {
    // Configuración de la petición con timeout
    const requestConfig = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      },
      // Timeout de 15 segundos para dar tiempo al servidor
      timeout: 15000
    };

    console.log('⏰ Enviando petición...');
    const startTime = Date.now();

    const response = await fetch(url, requestConfig);

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (__DEV__) {
      console.log('📊 === RESPUESTA RECIBIDA ===');
      console.log('⏱️ Tiempo de respuesta:', duration + 'ms');
      console.log('📊 Status:', response.status);
      console.log('🏷️ Status Text:', response.statusText);
      console.log('🔗 URL final:', response.url);
      console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
    }

    // Verificar el tipo de contenido
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);

    let data;

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
        if (__DEV__) {
          console.log('✅ JSON parseado correctamente:', data);
        }
      } catch (jsonError) {
        console.error('💥 Error parseando JSON:', jsonError);
        const text = await response.text();
        console.log('📄 Contenido de la respuesta:', text);
        throw new Error('El servidor no devolvió un JSON válido');
      }
    } else {
      const text = await response.text();
      console.log('📄 Respuesta no es JSON:', text.substring(0, 200) + '...');

      if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
        throw new Error('El servidor está devolviendo HTML en lugar de JSON. Verifica que el endpoint sea correcto y el servidor esté funcionando.');
      }

      throw new Error('El servidor no devolvió contenido JSON');
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error HTTP ${response.status}`;
      console.error('❌ === ERROR DE SERVIDOR ===');
      console.error('Status:', response.status);
      console.error('Mensaje:', errorMessage);
      console.error('Data completa:', data);

      throw new Error(errorMessage);
    }

    if (__DEV__) {
      console.log('🎉 === PETICIÓN EXITOSA ===');
      console.log('✅ Datos recibidos:', data);
    }

    return data;

  } catch (error) {
    if (__DEV__) {
      console.error('💥 === ERROR EN PETICIÓN ===');
      console.error('🌐 URL:', url);
      console.error('🔧 Método:', options.method || 'GET');
      console.error('❌ Tipo de error:', error.name);
      console.error('📝 Mensaje:', error.message);
      console.error('🔍 Stack:', error.stack);
    }

    // Mensajes de error más específicos
    if (error.name === 'TypeError' && error.message === 'Network request failed') {
      const troubleshootingMessage = `
No se pudo conectar con el servidor.

🔍 Pasos para solucionar:

1. ✅ Verifica que tu servidor esté corriendo:
   - Abre: http://localhost:8080
   - Deberías ver alguna respuesta

2. ✅ Para Expo + Android Emulator:
   - URL usada: ${url}
   - Verifica que el servidor escuche en 0.0.0.0:8080

3. ✅ Verifica la consola del servidor:
   - ¿Llegan las peticiones?
   - ¿Hay errores CORS?

4. ✅ Prueba desde el navegador:
   - http://localhost:8080/api/users/check-email?email=test@test.com
      `.trim();

      throw new Error(troubleshootingMessage);
    } else if (error.message.includes('timeout')) {
      throw new Error('La petición tardó demasiado tiempo. Verifica tu conexión y que el servidor esté respondiendo.');
    } else if (error.message.includes('JSON')) {
      throw new Error('Error en la respuesta del servidor. El servidor puede estar devolviendo HTML en lugar de JSON.');
    }

    throw error;
  }
};

// Métodos de utilidad
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    }),

  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' })
};

// Función de test de conectividad
export const testConnection = async () => {
  try {
    console.log('🧪 === TEST DE CONECTIVIDAD ===');
    console.log('🔗 Probando URL:', `${API_BASE_URL}/health`);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });

    console.log('📊 Test Status:', response.status);

    if (response.ok) {
      console.log('✅ Servidor responde correctamente');
      return true;
    } else {
      console.log('⚠️ Servidor responde pero con error');
      return false;
    }
  } catch (error) {
    console.log('❌ Test falló:', error.message);
    return false;
  }
};

// Función para verificar la configuración actual
export const checkApiConfig = () => {
  console.log('🔧 === CONFIGURACIÓN ACTUAL ===');
  console.log('📱 Plataforma:', Platform.OS);
  console.log('🌐 URL Base:', API_BASE_URL);
  console.log('🛠️ Modo desarrollo:', __DEV__);

  return {
    platform: Platform.OS,
    baseUrl: API_BASE_URL,
    isDevelopment: __DEV__
  };
};