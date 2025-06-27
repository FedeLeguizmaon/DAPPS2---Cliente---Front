import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/actions/cartActions'; // ⬅️ ajustá esta ruta según tu estructura

function Restaurant() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const restaurant = route.params?.restaurant;

  if (!restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No se pudo cargar el restaurante.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = (product) => {
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: product.currentPrice,
      quantity: 1, // Por defecto 1
      image: product.image,
      addons: {}, // Por ahora sin addons
    };

    dispatch(addToCart(itemToAdd));
    console.log('🛒 Agregado al carrito:', itemToAdd);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.restaurantName}>{restaurant.name}</Text>
      <Text style={styles.subTitle}>📍 {restaurant.distance} · 🕒 {restaurant.deliveryTime}</Text>

      {restaurant.categories.map((category, index) => (
        <View key={index} style={styles.categorySection}>
          <Text style={styles.categoryName}>{category.name}</Text>

          {category.products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDesc}>{product.description}</Text>
                <Text style={styles.productPrice}>💲{product.currentPrice}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddToCart(product)}
                >
                  <Text style={styles.addButtonText}>Agregar al carrito 🛒</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>⬅ Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  restaurantName: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  subTitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  categorySection: { marginBottom: 24 },
  categoryName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  productImage: { width: 100, height: 100, borderRadius: 8 },
  productInfo: { flex: 1, marginLeft: 10, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productDesc: { fontSize: 13, color: '#555', marginVertical: 4 },
  productPrice: { fontSize: 14, color: '#388e3c' },
  addButton: {
    marginTop: 6,
    backgroundColor: '#e91e63',
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  backButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#ddd',
    alignItems: 'center',
  },
  backButtonText: { fontWeight: 'bold' },
});

export default Restaurant;
