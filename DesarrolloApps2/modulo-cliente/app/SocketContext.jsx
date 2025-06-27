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

  // ✅ Estados específicos para pedidos
  const [pedidos, setPedidos] = useState({}); // {pedidoId: {estado, datos...}}
  const [pedidoActual, setPedidoActual] = useState(null); // ID del pedido que se está siguiendo

  // ✅ Funciones de autenticación
  const decodeJWTPayload = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
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

  // ✅ Función para extraer ID de pedido del concepto de pago
  const extractPedidoIdFromPayment = (concept) => {
    if (!concept || typeof concept !== 'string') {
      console.warn('⚠️ SocketContext: Concepto de pago inválido:', concept);
      return null;
    }

    const match = concept.match(/Pedido #([A-Z0-9]+)/);
    const extractedId = match ? match[1] : null;

    console.log('🔍 SocketContext: Extrayendo ID del concepto:', concept, '→', extractedId);
    return extractedId;
  };

  // ✅ Función para procesar eventos de pedido
  const processPedidoEvent = (eventData) => {
    console.log('🍕 SocketContext: Procesando evento de pedido:', eventData);

    const { event, data, ...restEventData } = eventData;

    switch (event) {
      case 'fiat.payment.request':
        console.log('💳 Evento de pago recibido:', data);
        const pedidoId = extractPedidoIdFromPayment(data?.concept);
        if (pedidoId) {
          console.log('🆔 ID de pedido extraído del pago:', pedidoId);
          setPedidos(prev => ({
            ...prev,
            [pedidoId]: {
              id: pedidoId,
              estado: 'PAGO_PROCESADO',
              fechaPago: new Date().toISOString(),
              total: parseFloat(data.amount) || 0,
              concepto: data.concept,
              ...prev[pedidoId], // Mantener datos existentes si los hay
              pagoData: data
            }
          }));
        } else {
          console.warn('⚠️ SocketContext: No se pudo extraer ID del concepto de pago:', data?.concept);
        }
        break;

      case 'pedido.aceptado':
        console.log('✅ Pedido aceptado:', data || restEventData);
        const aceptadoEventData = data || restEventData;
        const orderIdAceptado = aceptadoEventData.orderId || aceptadoEventData.pedidoId || aceptadoEventData.pedidoID;
        const estadoAceptado = aceptadoEventData.ESTADO || aceptadoEventData.estado || 'ACEPTADO';

        if (orderIdAceptado) {
          console.log('🆔 SocketContext: Procesando pedido.aceptado para:', orderIdAceptado, 'estado:', estadoAceptado);
          setPedidos(prev => ({
            ...prev,
            [orderIdAceptado]: {
              ...prev[orderIdAceptado], // Mantener datos existentes (ej: del pago)
              id: orderIdAceptado,
              estado: estadoAceptado,
              fechaAceptacion: new Date().toISOString(),
              ...aceptadoEventData
            }
          }));
        } else {
          console.warn('⚠️ SocketContext: pedido.aceptado sin orderId válido:', aceptadoEventData);
        }
        break;

      case 'pedido.coordenadas':
        console.log('📍 Coordenadas del pedido:', data || restEventData);
        const coordenadasEventData = data || restEventData;
        const orderIdCoordenadas = coordenadasEventData.orderId || coordenadasEventData.pedidoId || coordenadasEventData.idPedido;
        const estadoCoordenadas = coordenadasEventData.ESTADO || coordenadasEventData.estado;

        if (orderIdCoordenadas) {
          setPedidos(prev => ({
            ...prev,
            [orderIdCoordenadas]: {
              ...prev[orderIdCoordenadas],
              estado: estadoCoordenadas || prev[orderIdCoordenadas]?.estado,
              coordenadas: {
                latitud: coordenadasEventData.latitud,
                longitud: coordenadasEventData.longitud,
                timestamp: new Date().toISOString()
              },
              ...coordenadasEventData
            }
          }));
        }
        break;

      case 'pedido.asignado':
        console.log('👨‍🍳 Pedido asignado a repartidor:', data || restEventData);
        const asignadoEventData = data || restEventData;
        const orderIdAsignado = asignadoEventData.orderId || asignadoEventData.pedidoId || asignadoEventData.pedidoID;
        const estadoAsignado = asignadoEventData.ESTADO || asignadoEventData.estado || 'ASIGNADO';

        if (orderIdAsignado) {
          setPedidos(prev => ({
            ...prev,
            [orderIdAsignado]: {
              ...prev[orderIdAsignado],
              estado: estadoAsignado,
              repartidor: asignadoEventData.repartidor,
              fechaAsignacion: new Date().toISOString(),
              ...asignadoEventData
            }
          }));
        }
        break;

      case 'pedido.enCamino':
        console.log('🚗 Pedido en camino:', data || restEventData);
        const enCaminoEventData = data || restEventData;
        const orderIdEnCamino = enCaminoEventData.orderId || enCaminoEventData.pedidoId || enCaminoEventData.pedidoID;
        const estadoEnCamino = enCaminoEventData.ESTADO || enCaminoEventData.estado || 'EN_CAMINO';

        if (orderIdEnCamino) {
          setPedidos(prev => ({
            ...prev,
            [orderIdEnCamino]: {
              ...prev[orderIdEnCamino],
              estado: estadoEnCamino,
              fechaEnCamino: new Date().toISOString(),
              ...enCaminoEventData
            }
          }));
        }
        break;

      case 'pedido.entregado':
        console.log('✅ Pedido entregado:', data || restEventData);
        const entregadoEventData = data || restEventData;
        const orderIdEntregado = entregadoEventData.orderId || entregadoEventData.pedidoId || entregadoEventData.pedidoID;
        const estadoEntregado = entregadoEventData.ESTADO || entregadoEventData.estado || 'ENTREGADO';

        if (orderIdEntregado) {
          setPedidos(prev => ({
            ...prev,
            [orderIdEntregado]: {
              ...prev[orderIdEntregado],
              estado: estadoEntregado,
              fechaEntrega: new Date().toISOString(),
              ...entregadoEventData
            }
          }));
        }
        break;

      default:
        console.log('ℹ️ Evento de pedido no reconocido:', event);
        break;
    }
  };

  // ✅ Función para limpiar pedidos con ID inválido
  const limpiarPedidosInvalidos = () => {
    setPedidos(prev => {
      const pedidosLimpios = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (key && key !== 'undefined' && key !== 'null' && value?.id && value.id !== 'undefined') {
          pedidosLimpios[key] = value;
        } else {
          console.warn('🧹 SocketContext: Eliminando pedido con ID inválido:', key, value);
        }
      });
      return pedidosLimpios;
    });
  };

  // ✅ Función para obtener un pedido específico
  const getPedido = (pedidoId) => {
    return pedidos[pedidoId] || null;
  };

  // ✅ Función para establecer qué pedido seguir
  const setPedidoASeguir = (pedidoId) => {
    console.log('🎯 SocketContext: Estableciendo pedido a seguir:', pedidoId);
    setPedidoActual(pedidoId);
  };

  // ✅ Función para obtener el pedido actual que se está siguiendo
  const getPedidoActual = () => {
    return pedidoActual ? pedidos[pedidoActual] : null;
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
  }, []);

  // ✅ Limpiar pedidos inválidos al montar
  useEffect(() => {
    const timer = setTimeout(() => {
      limpiarPedidosInvalidos();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Conectar WebSocket cuando tenemos userId y token
  useEffect(() => {
    if (!userId || !token) {
      console.log('⏳ SocketContext: Esperando userId y token...', { userId, hasToken: !!token });
      return;
    }

    if (isTokenExpired(token)) {
      console.log('🚫 SocketContext: Token expirado, no se conectará WebSocket. Se necesita nuevo login.');
      return;
    }

    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      console.log('🧹 SocketContext: Cerrando WebSocket...');
      socketRef.current.close();
    }

    const url = getWebSocketUrl(userId, token);
    console.log('⚡️ SocketContext: Conectando WebSocket:', url.replace(token, '[TOKEN_OCULTO]'));

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

      if (event.code !== 1000 && userId && token) {
        console.log('🔄 SocketContext: Programando reconexión en 5 segundos...');
        setTimeout(() => {
          if (userId && token) {
            console.log('🔄 SocketContext: Intentando reconectar...');
            setToken(prevToken => prevToken); // Force re-render
          }
        }, 5000);
      }
    };

    socket.onerror = (error) => {
      console.error('❌ SocketContext: Error en WebSocket:', error);
      setConnected(false);

      if (error.message && (error.message.includes('403') || error.message.includes('401'))) {
        console.log('🚫 SocketContext: Error 403/401 - Posible token inválido. Esperando nuevo login...');

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

        const eventWithTimestamp = {
          ...parsed,
          receivedAt: new Date().toISOString()
        };

        // ✅ Procesar eventos de pedido Y eventos de pago
        if (parsed.event && (parsed.event.startsWith('pedido.') || parsed.event.includes('payment'))) {
          processPedidoEvent(parsed);
        }

        setEvents((prev) => [...prev, eventWithTimestamp]);
      } catch (e) {
        console.warn('⚠️ SocketContext: Error al parsear el mensaje:', e);
      }
    };

    return () => {
      if (socket) {
        console.log('🧹 SocketContext: Cerrando WebSocket...');
        socket.close();
      }
    };
  }, [userId, token]);

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
        userId,
        hasAuth: !!(userId && token),
        forceReconnect,

        // ✅ Funciones y estados para pedidos
        pedidos,
        getPedido,
        setPedidoASeguir,
        getPedidoActual,
        pedidoActual,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}