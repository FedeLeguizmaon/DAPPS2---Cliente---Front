import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext';
import Restaurante from './Restaurant.jsx';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useWebSocketEvent } from './UseWebSocketEvents';
function RestaurantCatalogue() {
  const context = useContext(SocketContext);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const catalogoEvent = useWebSocketEvent('Catalogo.ActualizadoTest');

  useEffect(() => {
    if (!catalogoEvent || !catalogoEvent.data) return;

    console.log('📦 Nuevo evento de catálogo recibido:', catalogoEvent);

    const { tenant, catalogo } = catalogoEvent.data;
    const productos = catalogo?.productos ?? [];

    const restaurant = {
      id: `tenant-${tenant.tenant_id}`,
      name: tenant.nombre,
      image: productos[0]?.imagenes?.[0]?.url ?? 'https://via.placeholder.com/150',
      deliveryTime: '20-30 min',
      distance: '1 km',
      rating: 4.5,
      categories: [...new Set(productos.map(p => p.categoria))],
      fullData: {
        id: `tenant-${tenant.tenant_id}`,
        name: tenant.nombre,
        image: productos[0]?.imagenes?.[0]?.url ?? 'https://via.placeholder.com/100',
        deliveryTime: '20-30 min',
        distance: '1 km',
        categories: [
          {
            name: 'Catálogo',
            products: productos.map(p => ({
              id: p.producto_id.toString(),
              name: p.nombre_producto,
              originalPrice: p.precio,
              currentPrice: p.precio,
              rating: 4.5,
              reviews: 0,
              image: p.imagenes?.[0]?.url ?? 'https://via.placeholder.com/300x200',
              description: p.descripcion,
              promociones: p.promociones ?? [],
            })),
          },
        ],
      },
    };

    setAllRestaurants((prev) => {
      const filtered = prev.filter((r) => r.id !== restaurant.id);
      return [...filtered, restaurant];
    });
  }, [catalogoEvent]);

  if (!context) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Conectando...</Text>
        <Text style={styles.debugText}>Verificando SocketProvider...</Text>
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