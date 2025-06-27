import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { usePedido } from './usePedido'; // ✅ NUEVO: Hook personalizado para pedidos

export default function OrderTracker() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector((state) => state.auth.user);

  // Obtener orderId de los parámetros
  const { orderId, orderDetails } = route.params || {};

  console.log('🔍 OrderTracker: Parámetros recibidos:', { orderId, hasOrderDetails: !!orderDetails });

  // ✅ NUEVO: Usar el hook de pedido para datos en tiempo real
  const {
    pedido,
    isLoading: pedidoLoading,
    connected,
    estado,
    estadoTexto,
    estadoColor,
    tiempoEstimado,
    tieneCoordenas,
    coordenadas,
    tieneRepartidor,
    repartidor,
    datosParaMapa
  } = usePedido(orderId);

  // Cargar datos iniciales del pedido si no vienen por parámetros
  useEffect(() => {
    console.log('🔄 OrderTracker: useEffect - orderId:', orderId, 'orderDetails:', !!orderDetails, 'pedido:', !!pedido);

    if (orderDetails) {
      // ✅ PRIORIDAD 1: Usar datos pasados por parámetros
      console.log('📋 OrderTracker: Usando orderDetails de parámetros');
      setOrderData(transformOrderDetails(orderDetails));
      setLoading(false);
      setError(null);
    } else if (pedido) {
      // ✅ PRIORIDAD 2: Usar datos del socket si están disponibles
      console.log('🔌 OrderTracker: Usando datos del socket');
      setOrderData(transformPedidoToOrderData(pedido));
      setLoading(false);
      setError(null);
    } else if (orderId && !pedidoLoading && !orderData) {
      // ✅ PRIORIDAD 3: Si tenemos orderId pero no hay datos, intentar cargar desde API
      console.log('🌐 OrderTracker: orderId disponible pero sin datos, cargando desde API');
      loadOrderData();
    } else if (!orderId) {
      // Sin orderId, mostrar error
      console.log('❌ OrderTracker: No hay orderId disponible');
      setError('No se especificó un ID de pedido');
      setLoading(false);
    }
  }, [orderId, orderDetails, pedido, pedidoLoading]);

  // ✅ NUEVO: Escuchar actualizaciones del socket para el pedido actual
  useEffect(() => {
    if (pedido && orderData && pedido.id === orderData.id) {
      console.log('🔄 OrderTracker: Actualizando con datos del socket para pedido:', pedido.id);
      // Mergear datos del socket con los datos existentes
      const updatedData = {
        ...orderData,
        ...transformPedidoToOrderData(pedido),
        id: pedido.id // Asegurar que el ID se mantenga
      };
      setOrderData(updatedData);
    }
  }, [pedido]);

  // ✅ NUEVO: Transformar datos del pedido del socket a formato del componente
  const transformPedidoToOrderData = (pedidoData) => {
    if (!pedidoData) return null;

    console.log('🔄 OrderTracker: Transformando datos del pedido del socket:', pedidoData);

    return {
      id: pedidoData.id,
      estado: pedidoData.estado,
      cliente: {
        nombre: user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : '',
        telefono: user?.telefono || '+54 11 0000-0000',
        direccion: pedidoData.direccionEntrega || 'Dirección de entrega  direccion:  Navarro 3684, C1419 CABA'
      },
      restaurante: pedidoData.restaurante || {
        nombre: 'Betular Pâtisserie',
        direccion: 'Mercedes 3900, C1419 CABA',
        telefono: '+54 11 4371-8141'
      },
      repartidor: repartidor ? {
        nombre: repartidor.nombre,
        telefono: repartidor.telefono,
        vehiculo: repartidor.vehiculo
      } : null,
      productos: pedidoData.productos || [
        { nombre: 'Pedido en proceso', cantidad: 1, precio: pedidoData.total || 0 }
      ],
      total: pedidoData.total || 0,
      tiempoEstimado: parseInt(tiempoEstimado.split('-')[0]) || 30,
      ubicacionRepartidor: coordenadas ? {
        lat: coordenadas.latitud,
        lng: coordenadas.longitud
      } : null,
      ubicacionDestino: pedidoData.ubicacionDestino || {
        lat:
          -34.60102917391953,
        lng: -58.505998479366276
      },
      ubicacionRestaurante: pedidoData.ubicacionRestaurante || {
        lat: -34.60124112209541,

        lng: -58.511995898155845
      }
    };
  };

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🌐 OrderTracker: Cargando datos del pedido desde API:', orderId);

      const apiResponse = await api.get(`/orders/${orderId}`);

      if (apiResponse && apiResponse.id) {
        console.log('✅ OrderTracker: Datos cargados desde API:', apiResponse);
        const realOrderData = transformOrderDetails(apiResponse);
        setOrderData(realOrderData);
        setError(null);
      } else {
        throw new Error('Datos del pedido no válidos');
      }
    } catch (err) {
      console.error('❌ OrderTracker: Error cargando datos del pedido:', err);

      // ✅ NUEVO: Usar datos mock como fallback para testing/desarrollo
      if (orderId && (orderId.startsWith('SP') || orderId === 'SP001')) {
        console.log('🎭 OrderTracker: Usando datos mock como fallback para:', orderId);
        const mockData = {
          id: orderId,
          estado: 'PAGO_PROCESADO', // Estado inicial cuando solo tenemos el pago
          cliente: {
            nombre: user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : 'Usuario',
            telefono: user?.telefono || '+54 11 0000-0000',
            direccion: 'Dirección de entrega : Navarro 3684, C1419 CABA'
          },
          restaurante: {
            nombre: 'Pizzería Güerrin',
            direccion: 'Av. Corrientes 1368, C1043 CABA',
            telefono: '+54 11 4371-8141'
          },
          repartidor: null, // Aún no asignado
          productos: [
            { nombre: 'Pedido en proceso', cantidad: 1, precio: 0 }
          ],
          total: 0,
          tiempoEstimado: 30,
          ubicacionRepartidor: null,
          ubicacionDestino: {
            lat: -34.60802877002906,
            lng: -58.37037817016744
          },
          ubicacionRestaurante: {
            lat: -34.604019345084936,
            lng: -58.385949813495365
          }
        };

        setOrderData(mockData);
        setError(null);
      } else {
        setError('No se pudo cargar la información del pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  const transformOrderDetails = (details) => {
    return {
      id: details.id,
      estado: details.estado || 'PENDIENTE',
      cliente: {
        nombre: details.user ? `${details.user.nombre} ${details.user.apellido}` : 'Usuario',
        telefono: details.user?.telefono || '+54 11 0000-0000',
        direccion: details.direccionEntrega || 'Dirección no disponible'
      },
      restaurante: {
        nombre: details.restaurante?.nombre || 'Restaurante',
        direccion: details.restaurante?.direccion || 'Dirección no disponible',
        telefono: details.restaurante?.telefono || 'Teléfono no disponible'
      },
      repartidor: details.repartidor ? {
        nombre: `${details.repartidor.nombre} ${details.repartidor.apellido || ''}`.trim(),
        telefono: details.repartidor.telefono || '',
        vehiculo: details.repartidor.vehiculo || 'Vehículo no especificado'
      } : null,
      productos: details.productos || [],
      total: details.total || 0,
      tiempoEstimado: details.tiempoEstimado || 30,
      ubicacionRepartidor: details.ubicacionRepartidor,
      ubicacionDestino: details.ubicacionDestino,
      ubicacionRestaurante: details.ubicacionRestaurante
    };
  };

  // HTML del mapa con marcadores
  const getMapHTML = () => {
    if (!orderData && !pedido) return '<div>Cargando mapa...</div>';

    const data = orderData || transformPedidoToOrderData(pedido);
    if (!data) return '<div>No hay datos para mostrar en el mapa</div>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          #map { height: 100vh; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${data.ubicacionDestino.lat}, ${data.ubicacionDestino.lng}], 14);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Marcador del restaurante
          L.marker([${data.ubicacionRestaurante.lat}, ${data.ubicacionRestaurante.lng}], {
            icon: L.divIcon({
              html: '<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [20, 20],
              className: 'custom-div-icon'
            })
          }).addTo(map).bindPopup('🍕 ${data.restaurante.nombre}');

          // Marcador del destino
          L.marker([${data.ubicacionDestino.lat}, ${data.ubicacionDestino.lng}], {
            icon: L.divIcon({
              html: '<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [20, 20],
              className: 'custom-div-icon'
            })
          }).addTo(map).bindPopup('🏠 ${data.cliente.nombre}');

          ${data.ubicacionRepartidor ? `
          // Marcador del repartidor (solo si está en camino)
          L.marker([${data.ubicacionRepartidor.lat}, ${data.ubicacionRepartidor.lng}], {
            icon: L.divIcon({
              html: '<div style="background-color: #FF6347; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [20, 20],
              className: 'custom-div-icon'
            })
          }).addTo(map).bindPopup('🏍️ ${data.repartidor?.nombre || 'Repartidor'}');
          ` : ''}

          // Ajustar vista para mostrar todos los marcadores
          const group = new L.featureGroup([
            L.marker([${data.ubicacionRestaurante.lat}, ${data.ubicacionRestaurante.lng}]),
            L.marker([${data.ubicacionDestino.lat}, ${data.ubicacionDestino.lng}])
            ${data.ubicacionRepartidor ? `, L.marker([${data.ubicacionRepartidor.lat}, ${data.ubicacionRepartidor.lng}])` : ''}
          ]);
          map.fitBounds(group.getBounds().pad(0.1));
        </script>
      </body>
      </html>
    `;
  };

  const handleCallRestaurant = () => {
    const telefono = orderData?.restaurante?.telefono;
    if (telefono) {
      Alert.alert(
        'Llamar al Restaurante',
        `¿Deseas llamar a ${orderData.restaurante.nombre}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Llamar', onPress: () => console.log(`Llamando a ${telefono}`) }
        ]
      );
    }
  };

  const handleCallDelivery = () => {
    const telefono = orderData?.repartidor?.telefono || repartidor?.telefono;
    if (telefono) {
      Alert.alert(
        'Llamar al Repartidor',
        `¿Deseas llamar al repartidor?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Llamar', onPress: () => console.log(`Llamando a ${telefono}`) }
        ]
      );
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleSupport = () => {
    Alert.alert(
      'Soporte',
      '¿Necesitas ayuda con tu pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Contactar Soporte', onPress: () => console.log('Contactando soporte...') }
      ]
    );
  };

  // Mostrar loading mientras carga (solo si realmente está cargando algo)
  if ((loading || (pedidoLoading && !orderData)) && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Cargando información del pedido...</Text>
        {!connected && (
          <Text style={styles.connectionWarning}>
            ⚠️ Reconectando con el servidor...
          </Text>
        )}
        <Text style={styles.debugText}>
          Debug: loading={loading.toString()}, pedidoLoading={pedidoLoading.toString()},
          orderData={!!orderData}, pedido={!!pedido}
        </Text>
      </View>
    );
  }

  // Mostrar error si no hay datos
  if (error && !orderData && !pedido) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={50} color="#FF6347" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrderData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <FontAwesome name="home" size={16} color="white" />
          <Text style={styles.buttonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Usar datos del socket si están disponibles, sino usar orderData
  const displayData = orderData || transformPedidoToOrderData(pedido);

  if (!displayData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No hay datos del pedido disponibles</Text>
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <FontAwesome name="home" size={16} color="white" />
          <Text style={styles.buttonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header con estado del pedido */}
        <View style={[styles.statusHeader, { backgroundColor: estadoColor || '#FF6347' }]}>
          <Text style={styles.statusText}>
            {estadoTexto || 'Procesando Pedido'}
          </Text>
          <Text style={styles.orderId}>Pedido #{displayData.id}</Text>
          <Text style={styles.estimatedTime}>
            Tiempo estimado: {tiempoEstimado || displayData.tiempoEstimado} minutos
          </Text>
          {!connected && (
            <Text style={styles.connectionStatus}>
              🔄 Reconectando...
            </Text>
          )}
        </View>

        {/* Mapa */}
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>📍 Seguimiento en Tiempo Real</Text>
          <View style={styles.mapWrapper}>
            {!isMapLoaded && (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color="#FF6347" />
                <Text style={styles.mapLoadingText}>Cargando mapa...</Text>
              </View>
            )}
            <WebView
              source={{ html: getMapHTML() }}
              style={[styles.map, !isMapLoaded && styles.hidden]}
              onLoadEnd={() => setIsMapLoaded(true)}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>

          {/* Leyenda del mapa */}
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Restaurante</Text>
            </View>
            {(displayData.ubicacionRepartidor || tieneCoordenas) && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF6347' }]} />
                <Text style={styles.legendText}>Repartidor</Text>
              </View>
            )}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendText}>Destino</Text>
            </View>
          </View>
        </View>

        {/* Información del pedido */}
        <View style={styles.addressContainer}>
          {/* Restaurante */}
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <FontAwesome name="cutlery" size={20} color="#4CAF50" />
              <Text style={styles.addressTitle}>Restaurante</Text>
              <TouchableOpacity style={styles.callButton} onPress={handleCallRestaurant}>
                <FontAwesome name="phone" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.restaurantName}>{displayData.restaurante.nombre}</Text>
            <Text style={styles.addressText}>{displayData.restaurante.direccion}</Text>
            {displayData.restaurante.telefono && (
              <Text style={styles.phoneText}>📞 {displayData.restaurante.telefono}</Text>
            )}
          </View>

          {/* Repartidor (si está asignado) */}
          {((displayData.estado === 'EN_CAMINO' || estado === 'EN_CAMINO' || estado === 'ASIGNADO') &&
            (displayData.repartidor || tieneRepartidor)) && (
              <View style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <FontAwesome name="motorcycle" size={20} color="#FF6347" />
                  <Text style={styles.addressTitle}>
                    {estado === 'EN_CAMINO' ? 'Repartidor en Camino' : 'Repartidor Asignado'}
                  </Text>
                  <TouchableOpacity style={styles.callButton} onPress={handleCallDelivery}>
                    <FontAwesome name="phone" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.deliveryName}>
                  {repartidor?.nombre || displayData.repartidor?.nombre}
                </Text>
                <Text style={styles.vehicleText}>
                  {repartidor?.vehiculo || displayData.repartidor?.vehiculo}
                </Text>
                {tieneCoordenas && (
                  <Text style={styles.locationText}>
                    📍 Ubicación: Lat {coordenadas.latitud.toFixed(4)}, Lng {coordenadas.longitud.toFixed(4)}
                  </Text>
                )}
                {(repartidor?.telefono || displayData.repartidor?.telefono) && (
                  <Text style={styles.phoneText}>
                    📞 {repartidor?.telefono || displayData.repartidor?.telefono}
                  </Text>
                )}
              </View>
            )}

          {/* Dirección de Destino */}
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <FontAwesome name="map-marker" size={20} color="#2196F3" />
              <Text style={styles.addressTitle}>Dirección de Entrega</Text>
            </View>
            <Text style={styles.customerName}>{displayData.cliente.nombre}</Text>
            <Text style={styles.addressText}>{displayData.cliente.direccion}</Text>
            {displayData.cliente.telefono && (
              <Text style={styles.phoneText}>📞 {displayData.cliente.telefono}</Text>
            )}
          </View>

          {/* Resumen del pedido */}
          {displayData.productos && displayData.productos.length > 0 && (
            <View style={styles.orderSummaryCard}>
              <Text style={styles.summaryTitle}>Resumen del Pedido</Text>
              {displayData.productos.map((producto, index) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>
                    {producto.cantidad}x {producto.nombre}
                  </Text>
                  <Text style={styles.productPrice}>${producto.precio}</Text>
                </View>
              ))}
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total: ${displayData.total}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.supportButton} onPress={handleSupport}>
          <FontAwesome name="question-circle" size={16} color="white" />
          <Text style={styles.buttonText}>Soporte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <FontAwesome name="home" size={16} color="white" />
          <Text style={styles.buttonText}>Inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  connectionWarning: {
    marginTop: 10,
    fontSize: 14,
    color: '#FF6347',
    textAlign: 'center',
  },
  debugText: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  connectionStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  statusHeader: {
    backgroundColor: '#FF6347',
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orderId: {
    color: '#fff',
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  estimatedTime: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  mapContainer: {
    height: 250,
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    padding: 10,
    backgroundColor: '#f8f8f8',
    textAlign: 'center',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  mapLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  addressContainer: {
    flex: 1,
    padding: 15,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  phoneText: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 5,
  },
  vehicleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

// Datos mock de backup para testing (mantener para desarrollo)
const mockOrderData = {
  'SP001': {
    id: 'SP001',
    estado: 'EN_CAMINO',
    cliente: {
      nombre: 'Juan Pérez',
      telefono: '+54 11 1234-5678',
      direccion: 'Casa Rosada, Balcarce 50, C1064AAB CABA'
    },
    restaurante: {
      nombre: 'Pizzería Güerrin',
      direccion: 'Av. Corrientes 1368, C1043 CABA',
      telefono: '+54 11 4371-8141'
    },
    repartidor: {
      nombre: 'Carlos Martinez',
      telefono: '+54 11 5555-1234',
      vehiculo: 'Moto Honda XR150'
    },
    productos: [
      { nombre: 'Pizza Napolitana', cantidad: 1, precio: 2200 },
      { nombre: 'Fainá', cantidad: 1, precio: 800 },
      { nombre: 'Coca-Cola 500ml', cantidad: 2, precio: 600 }
    ],
    total: 3600,
    tiempoEstimado: 15,
    ubicacionRepartidor: {
      lat: -34.60513444417913,
      lng: -58.378509242618875
    },
    ubicacionDestino: {
      lat: -34.60802877002906,
      lng: -58.37037817016744
    },
    ubicacionRestaurante: {
      lat: -34.604019345084936,
      lng: -58.385949813495365
    }
  }
};