import React, { createContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Creamos el contexto para usarlo con useContext en cualquier parte de la app
export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]); // Lista acumulada de eventos recibidos
  // ✅ Funciones de autenticación 
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

  const getUserId = async () => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        console.log('⚠️ SocketContext: No token available for getUserId');
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
        const userIdFromToken = await getUserId();
        const tokenFromStorage = await getStoredToken();
        
        setUserId(userIdFromToken);
        setToken(tokenFromStorage);
        
        console.log('🔐 SocketContext: Datos de auth cargados', {
          userId: userIdFromToken,
          hasToken: !!tokenFromStorage
        });
      } catch (error) {
        console.error('❌ SocketContext: Error cargando datos de auth:', error);
      }
    };

    loadAuthData();

    return () => {
      console.log('🔴 SocketProvider DESMONTADO');
    };
  }, []);

  // ✅ Conectar WebSocket cuando tenemos userId y token
  useEffect(() => {
    if (!userId || !token) {
      console.log('⏳ SocketContext: Esperando userId y token...', { userId, hasToken: !!token });
      return;
    }

    // ✅ URL configurable (localhost para desarrollo, IP para producción)
    const baseUrl = __DEV__ ? 'ws://localhost:8080' : 'ws://35.170.238.185:8080';
    const url = `${baseUrl}/ws/order-tracking?userId=${userId}&token=${encodeURIComponent(token)}`;
    console.log('⚡️ SocketContext: Conectando WebSocket:', url.replace(token, '[TOKEN_OCULTO]'));

    socketRef.current = new WebSocket(url);
    const socket = socketRef.current;

    socket.onopen = () => {
      console.log('✅ WebSocket conectado exitosamente!');
      setConnected(true);
    };

    socket.onclose = (event) => {
      console.log('🔌 WebSocket cerrado:', event);
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error('❌ Error en WebSocket:', error);
      setConnected(false);
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

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        sendMessage,
        events,
        userId, // ✅ Exponer userId para debugging
        hasAuth: !!(userId && token), // ✅ Estado de autenticación
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

