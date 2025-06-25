import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG, DEBUG_CONFIG, showCurrentConfig } from './config';

// Mostrar configuración al cargar el módulo
console.log('🚀 API inicializada');
showCurrentConfig();

const getHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    if (DEBUG_CONFIG.ENABLE_LOGS) {
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
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const headers = await getHeaders();

  if (DEBUG_CONFIG.LOG_REQUESTS) {
    console.log('🚀 === NUEVA PETICIÓN API ===');
    console.log('🌐 URL completa:', url);
    console.log('🔧 Método:', options.method || 'GET');
    console.log('📱 Plataforma:', Platform.OS);
    console.log('🏢 Entorno:', API_CONFIG.CURRENT_ENV);

    if (options.body) {
      console.log('📦 Body enviado:', options.body);
    }
  }

  try {
    const requestConfig = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      },
      timeout: API_CONFIG.TIMEOUT
    };

    if (DEBUG_CONFIG.ENABLE_LOGS) {
      console.log('⏰ Enviando petición...');
    }
    
    const startTime = Date.now();
    const response = await fetch(url, requestConfig);
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (DEBUG_CONFIG.LOG_RESPONSES) {
      console.log('📊 === RESPUESTA RECIBIDA ===');
      console.log('⏱️ Tiempo de respuesta:', duration + 'ms');
      console.log('📊 Status:', response.status);
      console.log('🏷️ Status Text:', response.statusText);
      console.log('🔗 URL final:', response.url);
      
      if (DEBUG_CONFIG.SHOW_NETWORK_DETAILS) {
        console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
      }
    }

    const contentType = response.headers.get('content-type');
    
    if (DEBUG_CONFIG.ENABLE_LOGS) {
      console.log('📄 Content-Type:', contentType);
    }

    let data;

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
        if (DEBUG_CONFIG.LOG_RESPONSES) {
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

    if (DEBUG_CONFIG.LOG_RESPONSES) {
      console.log('🎉 === PETICIÓN EXITOSA ===');
      console.log('✅ Datos recibidos:', data);
    }

    return data;

  } catch (error) {
    if (DEBUG_CONFIG.ENABLE_LOGS) {
      console.error('💥 === ERROR EN PETICIÓN ===');
      console.error('🌐 URL:', url);
      console.error('🔧 Método:', options.method || 'GET');
      console.error('🏢 Entorno:', API_CONFIG.CURRENT_ENV);
      console.error('❌ Tipo de error:', error.name);
      console.error('📝 Mensaje:', error.message);
    }

    // Mensajes de error específicos según el entorno
    if (error.name === 'TypeError' && error.message === 'Network request failed') {
      const isProduction = API_CONFIG.USE_PRODUCTION;
      
      const troubleshootingMessage = isProduction 
        ? `
❌ No se pudo conectar con Railway.

🔍 Posibles soluciones:
1. ✅ Verifica tu conexión a internet
2. ✅ Comprueba que Railway esté activo: ${API_CONFIG.BASE_URL}
3. ✅ Revisa los logs de Railway
4. 🔄 Cambia temporalmente a servidor local en config.js

URL probada: ${url}
        `.trim()
        : `
❌ No se pudo conectar con el servidor local.

🔍 Pasos para solucionar:
1. ✅ Verifica que tu servidor esté corriendo en puerto 8080
2. ✅ Abre: http://localhost:8080
3. ✅ Para Android Emulator, verifica: http://10.0.2.2:8080
4. 🔄 Cambia a Railway en config.js como alternativa

URL probada: ${url}
        `.trim();

      throw new Error(troubleshootingMessage);
    } else if (error.message.includes('timeout')) {
      throw new Error(`La petición tardó más de ${API_CONFIG.TIMEOUT/1000} segundos. ${API_CONFIG.USE_PRODUCTION ? 'Railway' : 'Servidor local'} no responde a tiempo.`);
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
    console.log('🏢 Entorno:', API_CONFIG.CURRENT_ENV);
    console.log('🔗 Probando URL:', `${API_CONFIG.BASE_URL}/health`);

    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });

    console.log('📊 Test Status:', response.status);

    if (response.ok) {
      console.log(`✅ ${API_CONFIG.CURRENT_ENV} responde correctamente`);
      return true;
    } else {
      console.log(`⚠️ ${API_CONFIG.CURRENT_ENV} responde pero con error`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test falló para ${API_CONFIG.CURRENT_ENV}:`, error.message);
    return false;
  }
};

// Función para verificar la configuración actual (deprecada, usa showCurrentConfig)
export const checkApiConfig = () => {
  return showCurrentConfig();
};