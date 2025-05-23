// config.js - Archivo de configuración separado
import { Platform } from 'react-native';

const getApiUrl = () => {
    // Para desarrollo local
    if (__DEV__) {
        if (Platform.OS === 'android') {
            // Para Android Emulator usa 10.0.2.2
            // Para dispositivo físico, usa tu IP local (ej: 192.168.1.100)
            return '181.93.50.196:8080/api'; // Android Emulator
            // return 'http://192.168.1.XXX:8080/api'; // Dispositivo físico - reemplaza XXX
        } else {
            // Para iOS Simulator
            return 'http://localhost:8080/api';
        }
    }

    // Para producción
    return 'https://tu-servidor-produccion.com/api';
};

export const API_CONFIG = {
    BASE_URL: getApiUrl(),
    TIMEOUT: 10000, // 10 segundos
};

// Configuración adicional para debugging
export const DEBUG_CONFIG = {
    ENABLE_LOGS: __DEV__, // Solo logs en desarrollo
    LOG_REQUESTS: __DEV__,
    LOG_RESPONSES: __DEV__,
};