import React, { createContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWebSocketUrl, showWebSocketConfig } from '../utils/config';

// Creamos el contexto para usarlo con useContext en cualquier parte de la app
export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]); // Lista acumulada de eventos recibidos
  // ✅ Funciones de autenticación (copiadas de Wallet.jsx)
  const decodeJWTPayload = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const payload = parts[1];
      // Decodificar base64url
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT payload:', error);
      return null;
    }
  };

  const getStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        console.log('🔑 SocketContext: Token obtenido desde AsyncStorage');
        return token;
      } else {
        console.log('⚠️ SocketContext: No hay token en AsyncStorage');
        return null;
      }
    } catch (error) {
      console.error('❌ SocketContext: Error obteniendo token:', error);
      return null;
    }
  };

  const isTokenExpired = (token) => {
    try {
      if (!token) return true;
      
      const payload = decodeJWTPayload(token);
      if (!payload || !payload.exp) {
        console.log('⚠️ SocketContext: Token sin fecha de expiración');
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        const expiredDate = new Date(payload.exp * 1000).toLocaleString();
        console.log('⏰ SocketContext: Token expirado desde:', expiredDate);
      } else {
        const expiresDate = new Date(payload.exp * 1000).toLocaleString();
        console.log('✅ SocketContext: Token válido hasta:', expiresDate);
      }
      
      return isExpired;
    } catch (error) {
      console.error('❌ SocketContext: Error verificando expiración del token:', error);
      return true;
    }
  };

  const getUserId = async () => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        console.log('⚠️ SocketContext: No token available for getUserId');
        return null;
      }

      // ✅ Verificar si el token está expirado
      if (isTokenExpired(token)) {
        console.log('🚫 SocketContext: Token expirado, no se puede extraer userId');
        return null;
      }

      const payload = decodeJWTPayload(token);
      const userId = payload?.id || payload?.sub;
      
      console.log('✅ SocketContext: UserId extraído del token:', userId);
      return userId ? userId.toString() : null;
      
    } catch (error) {
      console.error('❌ SocketContext: Error extracting userId from token:', error);
      return null;
    }
  };

  // ✅ Cargar userId y token al montar el componente
useEffect(() => {
  console.log('🟢 SocketProvider MONTADO');
    
    const loadAuthData = async () => {
      try {
        const tokenFromStorage = await getStoredToken();
        if (tokenFromStorage && !isTokenExpired(tokenFromStorage)) {
            const userIdFromToken = decodeJWTPayload(tokenFromStorage)?.id?.toString();
            setToken(tokenFromStorage);
            setUserId(userIdFromToken);
            console.log('🔐 SocketContext: Datos de auth cargados', { userId: userIdFromToken, hasToken: !!tokenFromStorage });
        } else {
            console.log('🔌 SocketContext: No hay token válido, esperando login.');
        }
      } catch (error) {
        console.error('❌ SocketContext: Error cargando datos de auth:', error);
      }
    };

    loadAuthData();

  return () => {
    console.log('🔴 SocketProvider DESMONTADO');
  };
  }, []); // Sin dependencias para que solo se ejecute una vez al montar

  // ✅ Conectar WebSocket cuando tenemos userId y token
  useEffect(() => {
    if (!userId || !token) {
      console.log('⏳ SocketContext: Esperando userId y token...', { userId, hasToken: !!token });
      return;
    }

    // ✅ Verificar que el token no esté expirado antes de conectar
    if (isTokenExpired(token)) {
      console.log('🚫 SocketContext: Token expirado, no se conectará WebSocket. Se necesita nuevo login.');
      return;
    }

    // ✅ Cerrar conexión anterior si existe
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      console.log('🧹 SocketContext: Cerrando WebSocket...');
      socketRef.current.close();
    }

    // ✅ Usar configuración centralizada de config.js
    const url = getWebSocketUrl(userId, token);
    console.log('⚡️ SocketContext: Conectando WebSocket:', url.replace(token, '[TOKEN_OCULTO]'));
    
    // ✅ Mostrar configuración para debugging
    showWebSocketConfig();

    socketRef.current = new WebSocket(url);
    const socket = socketRef.current;

    socket.onopen = () => {
      console.log('✅ SocketContext: WebSocket conectado exitosamente!');
      setConnected(true);
    };

    socket.onclose = (event) => {
      console.log('🔌 SocketContext: WebSocket cerrado:', event);
      setConnected(false);
      
      // ✅ Intentar reconectar solo si el cierre no fue intencional
      if (event.code !== 1000 && userId && token) {
        console.log('🔄 SocketContext: Programando reconexión en 5 segundos...');
        setTimeout(() => {
          if (userId && token) {
            console.log('🔄 SocketContext: Intentando reconectar...');
            // Triggear reconexión actualizando el state
            setToken(prevToken => prevToken); // Force re-render
          }
        }, 5000);
      }
    };

    socket.onerror = (error) => {
      console.error('❌ SocketContext: Error en WebSocket:', error);
      setConnected(false);
      
      // ✅ Manejo específico para diferentes códigos de error
      if (error.message && (error.message.includes('403') || error.message.includes('401'))) {
        console.log('🚫 SocketContext: Error 403/401 - Posible token inválido. Esperando nuevo login...');
        
        // ✅ Verificar si el token está expirado
        if (isTokenExpired(token)) {
          console.log('⏰ SocketContext: Confirmado - Token expirado. Usuario debe hacer login nuevamente.');
        }
      }
    };

    socket.onmessage = (event) => {
      console.log('📨 SocketContext: Mensaje recibido:', event.data);
      try {
        const parsed = JSON.parse(event.data);
        console.log('📦 SocketContext: Evento parseado:', parsed);
        
        // ✅ Agregar timestamp para debugging
        const eventWithTimestamp = {
          ...parsed,
          receivedAt: new Date().toISOString()
        };
        
        setEvents((prev) => [...prev, eventWithTimestamp]);
      } catch (e) {
        console.warn('⚠️ SocketContext: Error al parsear el mensaje:', e);
      }
    };

    // Limpiamos la conexión al desmontar el componente (por ejemplo, logout)
    return () => {
      if (socket) {
        console.log('🧹 SocketContext: Cerrando WebSocket...');
        socket.close();
      }
    };
  }, [userId, token]); // ✅ Dependencias actualizadas

  const sendMessage = (message) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const msg = typeof message === 'string' ? message : JSON.stringify(message);
      socket.send(msg);
      console.log('📤 Mensaje enviado:', msg);
    } else {
      console.warn('⚠️ WebSocket no está conectado. Estado:', socket?.readyState);
    }
  };

  // ✅ Función para forzar reconexión desde componentes externos
  const forceReconnect = async () => {
    console.log('🔄 SocketContext: Reconexión forzada solicitada...');
    const newToken = await getStoredToken();
    const newUserId = await getUserId();
    
    setUserId(newUserId);
    setToken(newToken);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        sendMessage,
        events,
        userId, // ✅ Exponer userId para debugging
        hasAuth: !!(userId && token), // ✅ Estado de autenticación
        forceReconnect, // ✅ Para reconectar manualmente
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

