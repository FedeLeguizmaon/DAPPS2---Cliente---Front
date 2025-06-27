import React, { useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SocketContext } from './SocketContext';

function RestaurantCatalogue() {
  const context = useContext(SocketContext);
  const navigation = useNavigation();
  const [comercios, setComercios] = useState([]);

  useEffect(() => {
  if (!context || !context.events) return;

  // Filtrar eventos stock.actualizado válidos
  const stockEvents = context.events.filter(
    event => event.topic === 'stock.actualizado' &&
             event.data &&
             event.data.comercio &&
             event.data.producto
  );

  if (stockEvents.length === 0) return;

  setComercios((prevComercios) => {
    // Usamos un mapa para facilitar la acumulación
    const acumulador = {};

    // Primero, clonar lo que ya teníamos
    prevComercios.forEach((comercio) => {
      acumulador[comercio.id] = {
        ...comercio,
        productos: [...comercio.productos],
      };
    });

    // Luego, procesar los eventos nuevos
    stockEvents.forEach(event => {
      const { comercio, producto } = event.data;
      if (!comercio || !producto) return;

      const comercioId = comercio.comercio_id;

      if (!acumulador[comercioId]) {
        acumulador[comercioId] = {
          id: comercioId,
          nombre: comercio.nombre,
          productos: [],
        };
      }

      const existeProducto = acumulador[comercioId].productos.some(
        (p) => p.id === producto.producto_id
      );

      if (!existeProducto) {
        acumulador[comercioId].productos.push({
          id: producto.producto_id,
          nombre: producto.nombre_producto,
          descripcion: producto.descripcion,
          precio: producto.precio,
        });
      } else {
        // Si querés actualizar el producto (precio, descripción), lo podés hacer acá.
        // Ejemplo:
        
        acumulador[comercioId].productos = acumulador[comercioId].productos.map(p =>
          p.id === producto.producto_id
            ? {
                ...p,
                nombre: producto.nombre_producto,
                descripcion: producto.descripcion,
                precio: producto.precio,
              }
            : p
        );
        
      }
    });

    // Devolvemos los valores acumulados como array
    return Object.values(acumulador);
  });
}, [context?.events]);


  if (!context) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text>Conectando al WebSocket...</Text>
      </View>
    );
  }

  const { connected } = context;

  return (
    <View style={{ flex: 1 }}>
      {/* Header con botón de carrito */}
      <View style={styles.header}>
        <Text style={styles.title}>Comercios y Productos</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')} // Asegurate de tener 'Cart' en tu navigator
        >
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.status}>
        {connected ? '🟢 Conectado' : '🔴 Desconectado'}
      </Text>

      <ScrollView style={styles.container}>
        {comercios.length === 0 ? (
          <Text style={styles.empty}>Esperando catalgo...</Text>
        ) : (
          comercios.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.comercioCard}
              onPress={() => navigation.navigate('Restaurant', {
                restaurant: {
                  id: c.id,
                  name: c.nombre,
                  image: 'https://via.placeholder.com/300x200',
                  deliveryTime: '20-30 min',
                  distance: '1.5 km',
                  categories: [{
                    name: 'Catálogo',
                    products: c.productos.map(p => ({
                      id: p.id,
                      name: p.nombre,
                      description: p.descripcion,
                      currentPrice: p.precio,
                      originalPrice: p.precio,
                      image: 'https://via.placeholder.com/300x200',
                      rating: 4.5,
                      reviews: 0,
                      additionalOptions: [],
                    })),
                  }]
                }
              })}
            >
              <Text style={styles.comercioNombre}>🏪 {c.nombre}</Text>
              {c.productos.map((p) => (
                <View key={p.id} style={styles.productoItem}>
                  <Text style={styles.productoNombre}>🍽 {p.nombre}</Text>
                  <Text style={styles.productoPrecio}>💲{p.precio}</Text>
                </View>
              ))}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  cartButton: {
    backgroundColor: '#f1f1f1',
    padding: 8,
    borderRadius: 20,
  },
  cartIcon: {
    fontSize: 22,
  },
  status: { marginLeft: 16, marginBottom: 12, fontStyle: 'italic' },
  empty: { textAlign: 'center', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  comercioCard: {
    marginBottom: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  comercioNombre: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  productoItem: { marginBottom: 8 },
  productoNombre: { fontSize: 16 },
  productoPrecio: { fontSize: 14, color: '#4caf50' },
});

export default RestaurantCatalogue;
