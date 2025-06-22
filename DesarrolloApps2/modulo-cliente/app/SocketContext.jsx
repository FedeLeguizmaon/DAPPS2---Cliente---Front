import React, { createContext, useEffect, useMemo, useState } from 'react';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const userId = 123;
    const [connected, setConnected] = useState(false);
    
    const socket = useMemo(() => {
        // Cambiar de http/https a ws/wss para WebSocket nativo
        const url = `ws://35.170.238.185:8080/ws/order-tracking?userId=${userId}`;
        console.log('⚡️ Intentando crear WebSocket con URL:', url);
        return new WebSocket(url);
    }, [userId]);

    console.log("🕵️ userId:", userId);

    useEffect(() => {
        if (!socket) {
            console.log('⚠️ Socket es nulo, no se pueden añadir listeners.');
            return;
        }

        const handleOpen = (event) => {
            console.log('✅ WebSocket conectado exitosamente!');
            console.log('📡 Estado de conexión:', socket.readyState);
            setConnected(true);
        };

        const handleClose = (event) => {
            console.log('🔌 WebSocket cerrado. Código:', event.code, 'Razón:', event.reason);
            console.log('📡 Estado de conexión:', socket.readyState);
            setConnected(false);
        };

        const handleError = (error) => {
            console.error('❌ Error en WebSocket:', error);
            console.log('📡 Estado de conexión:', socket.readyState);
            setConnected(false);
        };

        const handleMessage = (event) => {
            console.log('📨 Mensaje recibido:', event.data);
            // Aquí puedes procesar los mensajes recibidos
            try {
                const data = JSON.parse(event.data);
                console.log('📦 Datos parseados:', data);
            } catch (e) {
                console.log('📄 Mensaje de texto:', event.data);
            }
        };

        // Usar las propiedades del WebSocket nativo
        socket.onopen = handleOpen;
        socket.onclose = handleClose;
        socket.onerror = handleError;
        socket.onmessage = handleMessage;

        return () => {
            console.log('🧹 Limpiando WebSocket.');
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [socket]);

    // Función helper para enviar mensajes
    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
            socket.send(messageToSend);
            console.log('📤 Mensaje enviado:', messageToSend);
        } else {
            console.warn('⚠️ WebSocket no está conectado. Estado:', socket?.readyState);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, connected, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
}