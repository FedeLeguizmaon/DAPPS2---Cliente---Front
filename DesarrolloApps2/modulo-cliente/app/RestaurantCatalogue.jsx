import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext';
import Restaurante from './Restaurant.jsx';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useWebSocketEvent } from './UseWebSocketEvents';
 
function RestaurantCatalogue() {
  const context = useContext(SocketContext);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const stockEvent = useWebSocketEvent('stock.actualizado');
 
  useEffect(() => {
    if (!stockEvent || !stockEvent.data) return;
 
    console.log('📦 Nuevo evento recibido:', stockEvent);
 
    const { comercio, producto, stock } = stockEvent.data;
 
    const restaurantId = `comercio-${comercio.comercio_id}`;
 
    const restaurant = {
      id: restaurantId,
      name: comercio.nombre,
      image: 'https://via.placeholder.com/150',
      deliveryTime: '20-30 min',
      distance: '1 km',
      rating: 4.5,
      categories: [producto.categoria_nombre || 'Sin categoría'],
      fullData: {
        name: comercio.nombre,
        categories: [
          {
            name: producto.categoria_nombre || 'Catálogo',
            products: [
              {
                id: producto.producto_id.toString(),
                name: producto.nombre_producto,
                originalPrice: producto.precio,
                currentPrice: producto.precio,
                rating: 4.5,
                reviews: 0,
                image: 'https://via.placeholder.com/300x200',
                description:
                  producto.descripcion + ` (Stock actualizado: ${stock.cantidad_nueva})`,
                promociones: [],
              },
            ],
          },
        ],
      },
    };
 
    setAllRestaurants((prev) => {
      const filtered = prev.filter((r) => r.id !== restaurant.id);
      return [...filtered, restaurant];
    });
  }, [stockEvent]);
 
  if (!context) {
    return (
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
<ActivityIndicator size="large" color="#e91e63" />
<Text>Conectando...</Text>
<Text>Verificando SocketProvider...</Text>
</View>
    );
  }
 
  const { connected } = context;
 
  return (
<ScrollView style={styles.container}>
<Text style={styles.title}>Catálogo de Restaurantes</Text>
<Text style={styles.status}>
        {connected ? '🟢 Conectado' : '🔴 Desconectado'}
</Text>
 
      {allRestaurants.length === 0 ? (
<View style={styles.emptyContainer}>
<Text style={styles.emptyText}>
            Esperando restaurantes... {connected ? '⏳' : '📡'}
</Text>
</View>
      ) : (
<View>
<Text style={styles.countText}>
            📍 {allRestaurants.length} restaurante(s) encontrado(s)
</Text>
          {allRestaurants.map((restaurant) => (
<Restaurante key={restaurant.id} data={restaurant.fullData} />
          ))}
</View>
      )}
</ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  status: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  debug: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  debugText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#f44336',
    marginBottom: 10,
  },
  countText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 15,
    fontWeight: 'bold',
  },
});

export default RestaurantCatalogue;