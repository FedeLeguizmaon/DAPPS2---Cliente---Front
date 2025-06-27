import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext';

/**
 * Hook personalizado para manejar estados de pedido
 * @param {string} pedidoId - ID del pedido a seguir
 * @returns {object} Estado y funciones del pedido
 */
export function usePedido(pedidoId = null) {
    const socketContext = useContext(SocketContext);
    const [pedidoLocal, setPedidoLocal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Establecer el pedido a seguir cuando se proporciona un ID
    useEffect(() => {
        if (pedidoId && socketContext?.setPedidoASeguir) {
            console.log('🎯 usePedido: Estableciendo pedido a seguir:', pedidoId);
            socketContext.setPedidoASeguir(pedidoId);
        }
    }, [pedidoId, socketContext]);

    // Monitorear cambios en el pedido
    useEffect(() => {
        if (!socketContext) {
            console.log('⏳ usePedido: Esperando SocketContext...');
            return;
        }

        const { getPedido, getPedidoActual, pedidos } = socketContext;

        console.log('🔍 usePedido: Debug estado actual:', {
            pedidoId,
            totalPedidos: Object.keys(pedidos || {}).length,
            pedidosIds: Object.keys(pedidos || {}),
            pedidos: pedidos
        });

        // Obtener el pedido específico o el pedido actual
        let pedidoData = null;

        if (pedidoId) {
            pedidoData = getPedido(pedidoId);
            console.log('📦 usePedido: Obteniendo pedido específico:', pedidoId, pedidoData);
        } else {
            pedidoData = getPedidoActual();
            console.log('📦 usePedido: Obteniendo pedido actual:', pedidoData);
        }

        if (pedidoData) {
            setPedidoLocal(pedidoData);
            setLastUpdate(new Date().toISOString());
            setIsLoading(false);
            console.log('✅ usePedido: Pedido actualizado:', pedidoData);
        } else if (pedidoId) {
            // ✅ NUEVO: Si tenemos un pedidoId específico pero no datos del socket,
            // dejar que el componente padre maneje la carga desde API
            console.log('⚠️ usePedido: Pedido específico no encontrado en socket:', pedidoId);
            console.log('🔍 usePedido: Pedidos disponibles:', Object.keys(pedidos || {}));
            setIsLoading(false); // Permitir que el componente maneje la carga
            setPedidoLocal(null);
        } else if (Object.keys(pedidos || {}).length === 0) {
            // Solo mostrar loading si no hay pedidos en absoluto y no tenemos ID específico
            setIsLoading(true);
            console.log('⏳ usePedido: No hay datos de pedido disponibles');
        } else {
            setIsLoading(false);
            console.log('ℹ️ usePedido: Pedido no encontrado pero hay otros pedidos');
        }

    }, [socketContext?.pedidos, pedidoId, socketContext]);

    // Función para obtener el estado traducido a español
    const getEstadoTexto = (estado) => {
        const estados = {
            'PENDIENTE': 'Pedido Pendiente',
            'PAGO_PROCESADO': 'Pago Procesado',
            'ACEPTADO': 'Pedido Aceptado',
            'ASIGNADO': 'Repartidor Asignado',
            'EN_CAMINO': 'En Camino',
            'ENTREGADO': 'Entregado',
            'CANCELADO': 'Cancelado'
        };
        return estados[estado] || estado || 'Estado Desconocido';
    };

    // Función para obtener el color del estado
    const getEstadoColor = (estado) => {
        const colores = {
            'PENDIENTE': '#FF9800',
            'PAGO_PROCESADO': '#9C27B0',
            'ACEPTADO': '#FFA726',
            'ASIGNADO': '#42A5F5',
            'EN_CAMINO': '#FF7043',
            'ENTREGADO': '#66BB6A',
            'CANCELADO': '#EF5350'
        };
        return colores[estado] || '#9E9E9E';
    };

    // Función para obtener el tiempo estimado basado en el estado
    const getTiempoEstimado = (estado) => {
        const tiempos = {
            'PENDIENTE': '40-60',
            'PAGO_PROCESADO': '35-50',
            'ACEPTADO': '30-45',
            'ASIGNADO': '25-35',
            'EN_CAMINO': '10-20',
            'ENTREGADO': '0',
            'CANCELADO': '-'
        };
        return tiempos[estado] || '30-45';
    };

    // Función para verificar si el pedido tiene coordenadas
    const tieneCoordenas = () => {
        return !!(pedidoLocal?.coordenadas?.latitud && pedidoLocal?.coordenadas?.longitud);
    };

    // Función para obtener las coordenadas
    const getCoordenadas = () => {
        if (!tieneCoordenas()) return null;

        return {
            latitud: pedidoLocal.coordenadas.latitud,
            longitud: pedidoLocal.coordenadas.longitud,
            timestamp: pedidoLocal.coordenadas.timestamp
        };
    };

    // Función para verificar si hay repartidor asignado
    const tieneRepartidor = () => {
        return !!(pedidoLocal?.repartidor?.nombre || pedidoLocal?.repartidor?.apellido);
    };

    // Función para obtener datos del repartidor
    const getRepartidor = () => {
        if (!tieneRepartidor()) return null;

        const { repartidor } = pedidoLocal;
        return {
            nombre: `${repartidor.nombre || ''} ${repartidor.apellido || ''}`.trim(),
            telefono: repartidor.telefono || '',
            vehiculo: repartidor.vehiculo || 'Vehículo no especificado'
        };
    };

    // Función para obtener datos para el mapa
    const getDatosParaMapa = () => {
        if (!pedidoLocal) return null;

        const datos = {
            pedidoId: pedidoLocal.id,
            estado: pedidoLocal.estado,
            tieneRepartidor: tieneRepartidor(),
            tieneCoordenas: tieneCoordenas()
        };

        if (tieneCoordenas()) {
            datos.ubicacionRepartidor = getCoordenadas();
        }

        if (tieneRepartidor()) {
            datos.repartidor = getRepartidor();
        }

        return datos;
    };

    return {
        // Estado del pedido
        pedido: pedidoLocal,
        isLoading,
        lastUpdate,
        connected: socketContext?.connected || false,

        // Información del estado
        estado: pedidoLocal?.estado || null,
        estadoTexto: getEstadoTexto(pedidoLocal?.estado),
        estadoColor: getEstadoColor(pedidoLocal?.estado),
        tiempoEstimado: getTiempoEstimado(pedidoLocal?.estado),

        // Información de ubicación
        tieneCoordenas: tieneCoordenas(),
        coordenadas: getCoordenadas(),

        // Información del repartidor
        tieneRepartidor: tieneRepartidor(),
        repartidor: getRepartidor(),

        // Datos para componentes
        datosParaMapa: getDatosParaMapa(),

        // Funciones de utilidad
        getEstadoTexto,
        getEstadoColor,
        getTiempoEstimado,

        // Control del contexto
        setPedidoASeguir: socketContext?.setPedidoASeguir,
        socketContext
    };
}

/**
 * Hook para obtener todos los pedidos del usuario
 * @returns {object} Lista de pedidos y funciones
 */
export function usePedidos() {
    const socketContext = useContext(SocketContext);

    const pedidos = socketContext?.pedidos || {};
    const listaPedidos = Object.values(pedidos);

    // Ordenar por fecha de creación (más reciente primero)
    const pedidosOrdenados = listaPedidos.sort((a, b) => {
        const fechaA = a.fechaAceptacion || a.receivedAt || 0;
        const fechaB = b.fechaAceptacion || b.receivedAt || 0;
        return new Date(fechaB) - new Date(fechaA);
    });

    return {
        pedidos: pedidosOrdenados,
        totalPedidos: listaPedidos.length,
        pedidosActivos: listaPedidos.filter(p => !['ENTREGADO', 'CANCELADO'].includes(p.estado)),
        pedidosCompletos: listaPedidos.filter(p => ['ENTREGADO', 'CANCELADO'].includes(p.estado)),
        connected: socketContext?.connected || false,
        socketContext
    };
}