import React, { createContext, useEffect, useRef, useState } from 'react';

// Creamos el contexto para usarlo con useContext en cualquier parte de la app
export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const userId = 123; // Podés traerlo dinámicamente desde Redux si querés
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]); // Lista acumulada de eventos recibidos
useEffect(() => {
  console.log('🟢 SocketProvider MONTADO');

  return () => {
    console.log('🔴 SocketProvider DESMONTADO');
  };
}, []);
  useEffect(() => {
    const url = `ws://35.170.238.185:8080/ws/order-tracking?userId=${userId}`;
    console.log('⚡️ Conectando WebSocket:', url);

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
      console.log('📨 Mensaje recibido:', event.data);
      try {
        const parsed = JSON.parse(event.data);
        console.log('📦 Evento parseado:', parsed);
        setEvents((prev) => [...prev, parsed]);
      } catch (e) {
        console.warn('⚠️ Error al parsear el mensaje:', e);
      }
    };

    // Limpiamos la conexión al desmontar el componente (por ejemplo, logout)
    return () => {
      if (socket) {
        console.log('🧹 Cerrando WebSocket...');
        socket.close();
      }
    };
  }, [userId]);

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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

