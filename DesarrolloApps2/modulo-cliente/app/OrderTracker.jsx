import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Text, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';

// Datos mock de backup para testing
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

export default function OrderTracker() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector(state => state.cart.items);
  const cartTotal = useSelector(state => state.cart.total);

  // Obtener orderId de los parámetros o usar default para testing
  const { orderId, orderDetails } = route.params || { orderId: 'SP001' };

  // Cargar datos del pedido (real o mock)
  useEffect(() => {
    loadOrderData();
    // Simular actualizaciones cada 30 segundos
    const interval = setInterval(loadOrderData, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);

      // Si tenemos orderDetails desde la navegación, usar esos datos
      if (orderDetails) {
        const realOrderData = transformOrderDetails(orderDetails);
        setOrderData(realOrderData);
        setError(null);
      } else {
        // Intentar cargar desde la API
        try {
          const response = await api.get(`/pedidos/${orderId}`);
          const realOrderData = transformApiResponse(response);
          setOrderData(realOrderData);
          setError(null);
        } catch (apiError) {
          console.log('API no disponible, usando datos mock para testing');
          // Fallback a datos mock
          const data = mockOrderData[orderId];
          if (data) {
            setOrderData(data);
            setError(null);
          } else {
            setError(`Pedido ${orderId} no encontrado`);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Transformar datos del pedido real a formato esperado
  const transformOrderDetails = (details) => {
    return {
      id: details.id || 'SP' + Date.now(),
      estado: details.estado || 'EN_CAMINO',
      cliente: {
        nombre: user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Usuario',
        telefono: user?.telefono || '+54 11 0000-0000',
        direccion: details.direccionEntrega || 'Casa Rosada, Balcarce 50, C1064AAB CABA'
      },
      restaurante: {
        nombre: details.restaurante?.nombre || 'Pizzería Güerrin',
        direccion: details.restaurante?.direccion || 'Av. Corrientes 1368, C1043 CABA',
        telefono: details.restaurante?.telefono || '+54 11 4371-8141'
      },
      repartidor: {
        nombre: details.repartidor?.nombre || 'Carlos Martinez',
        telefono: details.repartidor?.telefono || '+54 11 5555-1234',
        vehiculo: details.repartidor?.vehiculo || 'Moto Honda XR150'
      },
      productos: details.productos || cartItems.map(item => ({
        nombre: item.name,
        cantidad: item.quantity,
        precio: item.price * item.quantity
      })),
      total: details.total || cartTotal,
      tiempoEstimado: details.tiempoEstimado || 15,
      ubicacionRepartidor: details.ubicacionRepartidor || {
        lat: -34.60513444417913,
        lng: -58.378509242618875
      },
      ubicacionDestino: details.ubicacionDestino || {
        lat: -34.60802877002906,
        lng: -58.37037817016744
      },
      ubicacionRestaurante: details.ubicacionRestaurante || {
        lat: -34.604019345084936,
        lng: -58.385949813495365
      }
    };
  };

  // Transformar respuesta de API a formato esperado
  const transformApiResponse = (apiResponse) => {
    return {
      id: apiResponse.id,
      estado: apiResponse.estado,
      cliente: {
        nombre: apiResponse.user?.nombre && apiResponse.user?.apellido ?
          `${apiResponse.user.nombre} ${apiResponse.user.apellido}` : 'Usuario',
        telefono: apiResponse.user?.telefono || '+54 11 0000-0000',
        direccion: apiResponse.direccionEntrega || 'Dirección no disponible'
      },
      restaurante: {
        nombre: apiResponse.restaurante?.nombre || 'Restaurante',
        direccion: apiResponse.restaurante?.direccion || 'Dirección no disponible',
        telefono: apiResponse.restaurante?.telefono || 'Teléfono no disponible'
      },
      repartidor: apiResponse.repartidor ? {
        nombre: apiResponse.repartidor.nombre,
        telefono: apiResponse.repartidor.telefono,
        vehiculo: apiResponse.repartidor.vehiculo
      } : null,
      productos: apiResponse.productos || [],
      total: apiResponse.total,
      tiempoEstimado: apiResponse.tiempoEstimado,
      ubicacionRepartidor: apiResponse.ubicacionRepartidor,
      ubicacionDestino: apiResponse.ubicacionDestino,
      ubicacionRestaurante: apiResponse.ubicacionRestaurante
    };
  };

  // Generar URL del mapa - versión mejorada con fallback inteligente
  const generateMapUrl = () => {
    if (!orderData) return null;

    const { ubicacionRestaurante, ubicacionDestino, ubicacionRepartidor } = orderData;

    // OPCIÓN 1: Intentar Google Maps Embed (requiere menos permisos)
    if (ubicacionRestaurante && ubicacionDestino) {
      const origin = `${ubicacionRestaurante.lat},${ubicacionRestaurante.lng}`;
      const destination = `${ubicacionDestino.lat},${ubicacionDestino.lng}`;

      // URL más simple que requiere solo Maps Embed API (básica)
      const basicMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyANtxF1NVF9egwbnPXuYKB_zaSm03GkCmA&q=${destination}&zoom=15&center=${origin}`;

      console.log('🗺️ Intentando Google Maps Embed básico');
      return basicMapsUrl;
    }

    // OPCIÓN 2: Fallback con mapa estático mejorado (SIEMPRE FUNCIONA)
    return generateAdvancedStaticMap();
  };

  // Generar mapa estático avanzado con ruta simulada muy realista
  const generateAdvancedStaticMap = () => {
    if (!orderData) return null;

    const { ubicacionRestaurante, ubicacionDestino, ubicacionRepartidor } = orderData;

    // Crear marcadores más grandes y visibles
    let markers = '';

    // Marcador del restaurante (Verde grande)
    if (ubicacionRestaurante) {
      markers += `&markers=color:green%7Clabel:🍕%7Csize:mid%7C${ubicacionRestaurante.lat},${ubicacionRestaurante.lng}`;
    }

    // Marcador del destino (Azul grande)
    if (ubicacionDestino) {
      markers += `&markers=color:blue%7Clabel:🏛️%7Csize:mid%7C${ubicacionDestino.lat},${ubicacionDestino.lng}`;
    }

    // Marcador del repartidor (Rojo grande) - solo si está en camino
    if (ubicacionRepartidor && orderData.estado === 'EN_CAMINO') {
      markers += `&markers=color:red%7Clabel:🏍️%7Csize:mid%7C${ubicacionRepartidor.lat},${ubicacionRepartidor.lng}`;
    }

    // Ruta muy realista siguiendo calles exactas de Buenos Aires
    let path = '';
    if (ubicacionRestaurante && ubicacionDestino) {
      // Ruta detallada: Güerrin → Casa Rosada siguiendo calles reales
      const routePoints = [
        `${ubicacionRestaurante.lat},${ubicacionRestaurante.lng}`, // Güerrin (Corrientes 1368)
        '-34.6037,-58.3820', // Corrientes y Callao
        '-34.6044,-58.3797', // Corrientes y Uruguay  
        '-34.6051,-58.3774', // Corrientes y Reconquista
        '-34.6058,-58.3755', // Hacia Av. de Mayo
        '-34.6076,-58.3743', // Av. de Mayo y Lima
        '-34.6080,-58.3720', // Hacia Plaza de Mayo
        `${ubicacionDestino.lat},${ubicacionDestino.lng}` // Casa Rosada
      ];

      path = `&path=color:0x1E90FF%7Cweight:5%7Cgeodesic:true%7C${routePoints.join('%7C')}`;
    }

    // Centrar el mapa en el punto medio
    const centerLat = ((ubicacionRestaurante?.lat || 0) + (ubicacionDestino?.lat || 0)) / 2;
    const centerLng = ((ubicacionRestaurante?.lng || 0) + (ubicacionDestino?.lng || 0)) / 2;

    console.log('🗺️ Usando mapa estático avanzado con ruta detallada');
    return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=14&size=400x300&maptype=roadmap${markers}${path}&key=AIzaSyANtxF1NVF9egwbnPXuYKB_zaSm03GkCmA`;
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
      <title>Seguimiento de Pedido</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        #map {
          height: 100vh;
          width: 100%;
        }
        #info {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255,255,255,0.9);
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          z-index: 1000;
          font-size: 12px;
        }
        .marker-label {
          background: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 10px;
        }
      </style>
      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyANtxF1NVF9egwbnPXuYKB_zaSm03GkCmA&language=es&region=AR"></script>
      <script>
        let map;
        let directionsRenderer;

        function initMap() {
          // Coordenadas exactas de tu pedido
          const restaurante = {
            lat: ${orderData?.ubicacionRestaurante?.lat || -34.604019345084936},
            lng: ${orderData?.ubicacionRestaurante?.lng || -58.385949813495365}
          };

          const destino = {
            lat: ${orderData?.ubicacionDestino?.lat || -34.60802877002906},
            lng: ${orderData?.ubicacionDestino?.lng || -58.37037817016744}
          };

          const repartidor = {
            lat: ${orderData?.ubicacionRepartidor?.lat || -34.60513444417913},
            lng: ${orderData?.ubicacionRepartidor?.lng || -58.378509242618875}
          };

          // Crear mapa centrado entre origen y destino
          const center = {
            lat: (restaurante.lat + destino.lat) / 2,
            lng: (restaurante.lng + destino.lng) / 2
          };

          map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          // Marcador del restaurante (Verde)
          new google.maps.Marker({
            position: restaurante,
            map: map,
            title: "Pizzería Güerrin - Origen",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="12" fill="#4CAF50" stroke="white" stroke-width="3"/>
                  <text x="15" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🍕</text>
                </svg>\`),
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          // Marcador del destino (Azul)
          new google.maps.Marker({
            position: destino,
            map: map,
            title: "Casa Rosada - Destino",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="12" fill="#2196F3" stroke="white" stroke-width="3"/>
                  <text x="15" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🏛️</text>
                </svg>\`),
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          // Marcador del repartidor (Rojo) - solo si está en camino
          ${orderData?.estado === 'EN_CAMINO' ? `
          new google.maps.Marker({
            position: repartidor,
            map: map,
            title: "Repartidor - ${orderData?.repartidor?.nombre || 'Carlos Martinez'}",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                <svg width="35" height="35" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="17.5" cy="17.5" r="15" fill="#FF5722" stroke="white" stroke-width="3"/>
                  <text x="17.5" y="23" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🏍️</text>
                </svg>\`),
              scaledSize: new google.maps.Size(35, 35)
            }
          });
          ` : ''}

          // Configurar el renderer de direcciones
          directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true, // No mostrar marcadores por defecto
            polylineOptions: {
              strokeColor: '#1976D2',
              strokeWeight: 5,
              strokeOpacity: 0.8
            }
          });
          directionsRenderer.setMap(map);

          // Calcular y mostrar la ruta
          const directionsService = new google.maps.DirectionsService();
          
          ${orderData?.estado === 'EN_CAMINO' ? `
          // Si está en camino, ruta desde repartidor hasta destino
          directionsService.route(
            {
              origin: repartidor,
              destination: destino,
              travelMode: google.maps.TravelMode.DRIVING,
              avoidTolls: true,
              region: 'AR'
            },
            (response, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
                
                // Calcular tiempo estimado
                const route = response.routes[0];
                const leg = route.legs[0];
                console.log('Tiempo estimado:', leg.duration.text);
                console.log('Distancia:', leg.distance.text);
              } else {
                console.error('Error calculando ruta desde repartidor:', status);
                // Fallback: ruta completa desde restaurante
                calcularRutaCompleta();
              }
            }
          );
          ` : `
          // Si no está en camino, mostrar ruta completa
          calcularRutaCompleta();
          `}

          function calcularRutaCompleta() {
            directionsService.route(
              {
                origin: restaurante,
                destination: destino,
                travelMode: google.maps.TravelMode.DRIVING,
                avoidTolls: true,
                region: 'AR'
              },
              (response, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                  directionsRenderer.setDirections(response);
                  
                  // Información de la ruta
                  const route = response.routes[0];
                  const leg = route.legs[0];
                  console.log('Ruta completa - Tiempo:', leg.duration.text, 'Distancia:', leg.distance.text);
                } else {
                  console.error('Error calculando ruta completa:', status);
                  alert('No se pudo calcular la ruta: ' + status);
                }
              }
            );
          }

          // Ajustar vista para mostrar todos los puntos
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(restaurante);
          bounds.extend(destino);
          ${orderData?.estado === 'EN_CAMINO' ? 'bounds.extend(repartidor);' : ''}
          map.fitBounds(bounds);
          
          // Agregar un poco de padding
          setTimeout(() => {
            map.panBy(0, -50);
          }, 1000);
        }

        // Inicializar mapa cuando se carga la página
        window.onload = initMap;
      </script>
    </head>
    <body>
      <div id="info">
        <div><strong>Pedido #${orderData?.id || 'SP001'}</strong></div>
        <div>Estado: ${orderData?.estado || 'EN_CAMINO'}</div>
        <div>🍕 Pizzería Güerrin</div>
        <div>🏛️ Casa Rosada</div>
        ${orderData?.estado === 'EN_CAMINO' ? `<div>🏍️ ${orderData?.repartidor?.nombre || 'Repartidor'}</div>` : ''}
      </div>
      <div id="map"></div>
    </body>
    </html>
  `;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return '#FFA500';
      case 'CONFIRMADO': return '#4CAF50';
      case 'PREPARANDO': return '#2196F3';
      case 'EN_CAMINO': return '#FF6347';
      case 'ENTREGADO': return '#4CAF50';
      case 'CANCELADO': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente de confirmación';
      case 'CONFIRMADO': return 'Confirmado por el restaurante';
      case 'PREPARANDO': return 'Preparando tu pedido';
      case 'EN_CAMINO': return 'En camino hacia ti';
      case 'ENTREGADO': return 'Pedido entregado';
      case 'CANCELADO': return 'Pedido cancelado';
      default: return 'Estado desconocido';
    }
  };

  const handleSupport = () => {
    console.log('Contactar soporte');
    // Aquí implementarías la lógica de soporte
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  const handleCallDelivery = () => {
    if (orderData?.repartidor?.telefono) {
      console.log(`Llamar al repartidor: ${orderData.repartidor.telefono}`);
      // Aquí implementarías la lógica para hacer la llamada
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Cargando información del pedido...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrderData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={handleHome}>
          <Text style={styles.buttonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!orderData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró información del pedido</Text>
        <TouchableOpacity style={styles.homeButton} onPress={handleHome}>
          <Text style={styles.buttonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const estadoColor = getEstadoColor(orderData.estado);
  const estadoTexto = getEstadoTexto(orderData.estado);

  return (
    <View style={styles.container}>
      {/* Header con estado del pedido */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pedido #{orderData.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: estadoColor }]}>
            <Text style={styles.statusText}>{orderData.estado}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadOrderData}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Información de estado */}
      <View style={[styles.statusContainer, { backgroundColor: estadoColor }]}>
        <Text style={styles.statusDescription}>{estadoTexto}</Text>
        {orderData.tiempoEstimado && orderData.estado !== 'ENTREGADO' && (
          <Text style={styles.estimatedTime}>
            Tiempo estimado: {orderData.tiempoEstimado} minutos
          </Text>
        )}
      </View>

      {/* Información de direcciones */}
      <ScrollView style={styles.addressContainer}>
        {/* Dirección del Restaurante */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <FontAwesome name="cutlery" size={20} color="#4CAF50" />
            <Text style={styles.addressTitle}>Restaurante (Origen)</Text>
          </View>
          <Text style={styles.restaurantName}>{orderData.restaurante.nombre}</Text>
          <Text style={styles.addressText}>{orderData.restaurante.direccion}</Text>
          {orderData.restaurante.telefono && (
            <Text style={styles.phoneText}>📞 {orderData.restaurante.telefono}</Text>
          )}
        </View>

        {/* Ubicación del Repartidor (si está en camino) */}
        {orderData.estado === 'EN_CAMINO' && orderData.repartidor && (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <FontAwesome name="motorcycle" size={20} color="#FF6347" />
              <Text style={styles.addressTitle}>Repartidor en Camino</Text>
              <TouchableOpacity style={styles.callButton} onPress={handleCallDelivery}>
                <FontAwesome name="phone" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.deliveryName}>{orderData.repartidor.nombre}</Text>
            <Text style={styles.vehicleText}>{orderData.repartidor.vehiculo}</Text>
            <Text style={styles.locationText}>
              📍 Ubicación actual: Lat {orderData.ubicacionRepartidor.lat.toFixed(4)},
              Lng {orderData.ubicacionRepartidor.lng.toFixed(4)}
            </Text>
            {orderData.repartidor.telefono && (
              <Text style={styles.phoneText}>📞 {orderData.repartidor.telefono}</Text>
            )}
          </View>
        )}

        {/* Dirección de Destino */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <FontAwesome name="map-marker" size={20} color="#2196F3" />
            <Text style={styles.addressTitle}>Dirección de Entrega</Text>
          </View>
          <Text style={styles.customerName}>{orderData.cliente.nombre}</Text>
          <Text style={styles.addressText}>{orderData.cliente.direccion}</Text>
          {orderData.cliente.telefono && (
            <Text style={styles.phoneText}>📞 {orderData.cliente.telefono}</Text>
          )}
        </View>

        {/* Resumen del pedido */}
        <View style={styles.orderSummaryCard}>
          <Text style={styles.summaryTitle}>Resumen del Pedido</Text>
          {orderData.productos.map((producto, index) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productName}>
                {producto.cantidad}x {producto.nombre}
              </Text>
              <Text style={styles.productPrice}>${producto.precio}</Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ${orderData.total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>Ubicación en tiempo real</Text>
        {!isMapLoaded && (
          <View style={styles.mapLoadingContainer}>
            <ActivityIndicator size="large" color="#e91e63" />
            <Text style={styles.mapLoadingText}>Cargando mapa...</Text>
          </View>
        )}

        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={[styles.map, !isMapLoaded && styles.hidden]}
          onLoadEnd={() => setIsMapLoaded(true)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />

        {/* Leyenda del mapa */}
        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Restaurante</Text>
          </View>
          {orderData.estado === 'EN_CAMINO' && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6347' }]} />
              <Text style={styles.legendText}>Repartidor</Text>
            </View>
          )}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Tu dirección</Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.supportButton} onPress={handleSupport}>
          <FontAwesome name="headphones" size={20} color="#fff" />
          <Text style={styles.buttonText}>Soporte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={handleHome}>
          <FontAwesome name="home" size={20} color="#fff" />
          <Text style={styles.buttonText}>Inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 5,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  statusContainer: {
    padding: 15,
    alignItems: 'center',
  },
  statusDescription: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  estimatedTime: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
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