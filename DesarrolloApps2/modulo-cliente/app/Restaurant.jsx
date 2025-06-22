import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import Product from './Product'; // Asegúrate de que la ruta sea correcta
// CORRECCIÓN: Remover la importación incorrecta de AsyncStorage
// import { AsyncStorage } from 'react-native'; // ❌ ESTA LÍNEA SE ELIMINA

// Si necesitas AsyncStorage en este componente, usa la importación correcta:
// import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ CORRECTA
import { useNavigation } from '@react-navigation/native'; // Importa el hook de navegación

function Restaurant({ route }) {
  if (restaurant.categories.length === 0) {
  return (
    <View style={styles.loadingContainer}>
      <Text>Este restaurante no tiene productos disponibles en el momento.</Text>
      <TouchableOpacity style={styles.backButtonEmpty} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
  const navigation = useNavigation();
  // Datos de restaurante de ejemplo. Se usarán si route.params.restaurant es undefined.
  // Es crucial tener estos datos completos para que la pantalla no falle en desarrollo si se carga directamente.
  const exampleRestaurantData = {
    id: 'restaurant_example',
    name: 'Great Burgers & More (Ejemplo)',
    image: 'https://via.placeholder.com/100/FF0000/FFFFFF?text=Restaurante', // Imagen de ejemplo para el restaurante
    deliveryTime: '25-35 min',
    distance: '2.5 km',
    categories: [
      {
        name: 'Burgers',
        products: [
          {
            id: 'burger_1',
            name: 'Classic Cheeseburger',
            originalPrice: 12.00,
            currentPrice: 8.50,
            rating: 4.5,
            reviews: 800,
            image: 'https://via.placeholder.com/300x200/FF5733/FFFFFF?text=Burger', // Imagen de ejemplo
            description: 'A classic cheeseburger with lettuce, tomato, onion, pickles, and our special sauce.',
            additionalOptions: [
              { id: 'extra_cheese', name: 'Extra Cheese', price: 0.75 },
              { id: 'add_fries', name: 'Add Fries', price: 2.00 },
            ],
          },
          {
            id: 'burger_2',
            name: 'Spicy Chicken Burger',
            originalPrice: 10.00,
            currentPrice: 7.00,
            rating: 4.3,
            reviews: 500,
            image: 'https://via.placeholder.com/300x200/C70039/FFFFFF?text=ChickenBurger', // Imagen de ejemplo
            description: 'Grilled chicken patty with jalapeños, pepper jack cheese, and spicy mayo.',
            additionalOptions: [
              { id: 'extra_jalapenos', name: 'Extra Jalapeños', price: 0.50 },
            ],
          },
        ],
      },
      {
        name: 'Sides',
        products: [
          {
            id: 'side_1',
            name: 'French Fries',
            originalPrice: 4.00,
            currentPrice: 3.00,
            rating: 4.7,
            reviews: 1200,
            image: 'https://via.placeholder.com/300x200/FFC300/000000?text=Fries', // Imagen de ejemplo
            description: 'Crispy golden french fries, perfectly salted.',
            additionalOptions: [],
          },
          {
            id: 'side_2',
            name: 'Onion Rings',
            originalPrice: 5.00,
            currentPrice: 4.00,
            rating: 4.2,
            reviews: 300,
            image: 'https://via.placeholder.com/300x200/FFC300/000000?text=OnionRings', // Imagen de ejemplo
            description: 'Crunchy onion rings with a side of dipping sauce.',
            additionalOptions: [],
          },
        ],
      },
      {
        name: 'Drinks', // Nueva categoría de ejemplo
        products: [
          {
            id: 'drink_1',
            name: 'Coca-Cola',
            originalPrice: 2.50,
            currentPrice: 2.00,
            rating: 4.8,
            reviews: 1500,
            image: 'https://via.placeholder.com/300x200/000000/FFFFFF?text=CocaCola',
            description: 'Classic Coca-Cola soda.',
            additionalOptions: [],
          },
        ],
      },
    ],
  };

  // Prioriza los datos de la ruta, si no existen, usa los de ejemplo.
  const restaurant = route.params?.restaurant || exampleRestaurantData;

  // Si los datos del restaurante aún no son válidos (por si el exampleRestaurantData estuviera incompleto),
  // mostramos un indicador de carga o un mensaje de error.
  if (!restaurant || !restaurant.categories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text>Cargando información del restaurante...</Text>
        <TouchableOpacity style={styles.backButtonEmpty} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleProductPress = (product,categoryName) => {
    navigation.navigate('Product', { product, categoryName}); // Pasa el objeto completo del producto
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header del Restaurante */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.restaurantInfo}>
          <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
          <View style={styles.restaurantTextInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.restaurantMeta}>
              <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
              <Text style={styles.distance}>{restaurant.distance}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menuContainer}>
        {/* Verifica que restaurant.categories exista antes de mapear */}
        {restaurant.categories && restaurant.categories.map((category, index) => (
          <View key={index} style={styles.categorySection}>
            <Text style={styles.categoryName}>{category.name}</Text>
            {/* Verifica que category.products exista antes de mapear */}
            {category.products && category.products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productItemContainer}
                onPress={() => handleProductPress(product,category.name)}
              >
                <View style={styles.productItemContent}>
                  <Image source={{ uri: product.image }} style={styles.productThumbnail} />
                  <View style={styles.productTextInfo}>
                    <Text style={styles.productItemName}>{product.name}</Text>
                    {/* Asegúrate de que la descripción no sea undefined */}
                    <Text style={styles.productItemDescription}>
                      {product.description ? `${product.description.substring(0, 70)}...` : ''}
                    </Text>
                    <Text style={styles.productItemPrice}>£ {product.currentPrice.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.productArrow}>{'>'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={{ height: 20 }} />{/* Espacio extra al final del scroll */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Un gris muy claro para el fondo principal
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backButtonEmpty: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e91e63',
    borderRadius: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50, // Ajustado para la barra de estado
    paddingBottom: 20,
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
    marginRight: 10, // Espacio entre el botón y la info del restaurante
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  restaurantInfo: {
    flex: 1, // Permite que ocupe el espacio disponible
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImage: {
    width: 70,
    height: 70,
    borderRadius: 10, // Bordes redondeados
    marginRight: 15,
    backgroundColor: '#eee', // Placeholder mientras carga
  },
  restaurantTextInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#777',
    marginRight: 10,
  },
  distance: {
    fontSize: 14,
    color: '#777',
  },
  filterButton: {
    padding: 10,
    marginLeft: 10, // Espacio entre la info del restaurante y el botón de filtro
  },
  filterIcon: {
    fontSize: 24,
    color: '#333',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  productItemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  productThumbnail: {
    width: 80, // Aumentado un poco el tamaño de la imagen del producto
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#eee', // Placeholder
  },
  productTextInfo: {
    flex: 1,
  },
  productItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  productItemDescription: {
    fontSize: 13,
    color: '#777',
    marginBottom: 5,
  },
  productItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e91e63', // Color distintivo para el precio
  },
  productArrow: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 10,
  },
});

export default Restaurant;