import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext';
import Restaurante from './Restaurant.jsx';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';

function RestaurantCatalogue({  }) {
  const { socket, connected } = useContext(SocketContext);
  const [allRestaurants, setAllRestaurants] = useState([]);


  useEffect(() => {
    if (!socket || !connected) return;

    const handleMessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.topico === 'Catalogo.ActualizadoTest') {
          const { tenant, catalogo } = parsed.payload;
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
        }
      } catch (error) {
        console.error('Error al procesar mensaje WebSocket', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, connected]);

  return (
    <div>
      {allRestaurants.map((restaurant) => (
        <Restaurante key={restaurant.id} data={restaurant.fullData} />
      ))}
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50, // Ajuste para el statusBar
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    padding: 10,
  },
  cartIcon: {
    fontSize: 24,
    color: '#333',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 20,
    color: '#777',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  filterButton: {
    padding: 10,
  },
  filterIcon: {
    fontSize: 20,
    color: '#333',
  },
  categorySelector: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 0, // Reducido de 8 a 5
    paddingHorizontal: 15,
    marginRight: 10,
  },
  selectedCategoryPill: {
    backgroundColor: '#e91e63',
  },
  categoryPillIcon: {
    fontSize: 16, // Ligeramente reducido de 18 a 16
    marginRight: 4, // Ligeramente reducido de 5 a 4
  },
  categoryPillText: {
    fontSize: 13, // Ligeramente reducido de 14 a 13
    fontWeight: 'bold',
    color: '#333',
  },
  selectedCategoryPillText: {
    color: '#fff',
  },
  restaurantList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 20, // Espacio al final de la lista
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden', // Asegura que la imagen no se desborde
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantCardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  restaurantCardInfo: {
    padding: 15,
  },
  restaurantCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantCardDeliveryTime: {
    fontSize: 13,
    color: '#777',
    marginRight: 10,
  },
  restaurantCardDistance: {
    fontSize: 13,
    color: '#777',
    marginRight: 10,
  },
  restaurantCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  ratingText: {
    fontSize: 13,
    color: '#333',
    fontWeight: 'bold',
  },
  noRestaurantsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
});

export default RestaurantCatalogue;