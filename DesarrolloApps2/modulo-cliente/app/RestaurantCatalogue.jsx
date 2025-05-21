import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';

function RestaurantCatalogue({ navigation, route }) {
  // `selectedCategory` se espera que venga de la navegación desde Home.jsx
  const { selectedCategory } = route.params || {};

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState(selectedCategory || 'All'); // Inicializa con la categoría seleccionada o 'All'

  // Función para obtener los datos de los restaurantes.
  // En una aplicación real, esto sería una llamada a la API.
  const getRestaurantData = () => {
    return [
      { id: 1, name: 'Burger Palace', categories: ['Burger', 'Fast Food'], image: 'https://via.placeholder.com/80', deliveryTime: '20-30 min', distance: '1.2 km', rating: 4.5 },
      { id: 2, name: 'Taco Haven', categories: ['Taco', 'Mexican'], image: 'https://via.placeholder.com/80', deliveryTime: '25-35 min', distance: '2.5 km', rating: 4.8 },
      { id: 3, name: 'Green Salad Bar', categories: ['Salad', 'Healthy'], image: 'https://via.placeholder.com/80', deliveryTime: '15-25 min', distance: '0.8 km', rating: 4.2 },
      { id: 4, name: 'Noodle Nook', categories: ['Noodles', 'Asian'], image: 'https://via.placeholder.com/80', deliveryTime: '30-40 min', distance: '3.0 km', rating: 4.6 },
      { id: 5, name: 'Pizza Paradise', categories: ['Pizza', 'Italian'], image: 'https://via.placeholder.com/80', deliveryTime: '20-30 min', distance: '1.5 km', rating: 4.7 },
      { id: 6, name: 'Sweet Delights', categories: ['Dessert', 'Bakery'], image: 'https://via.placeholder.com/80', deliveryTime: '10-20 min', distance: '0.5 km', rating: 4.9 },
      // ... más restaurantes
    ];
  };
  const restaurants = getRestaurantData();

  // Categorías de ejemplo para los botones de filtro
  const categories = ['All', 'Burger', 'Taco', 'Salad', 'Pizza', 'Noodles', 'Dessert', 'More...'];

  // Efecto para actualizar el filtro activo si la categoría seleccionada cambia desde las props de navegación
  useEffect(() => {
    if (selectedCategory) {
      setActiveFilter(selectedCategory);
    }
  }, [selectedCategory]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = activeFilter === 'All' || restaurant.categories.includes(activeFilter);
    return matchesSearch && matchesCategory;
  });

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('Restaurant', { restaurant }); // Navega al componente Restaurant.jsx
  };

  return (
    <View style={styles.container}>
      {/* Header (Buscador) */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchIconContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de Categorías */}
      <View style={styles.categoryFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollView}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                activeFilter === category && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveFilter(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                activeFilter === category && styles.activeCategoryButtonText,
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Restaurantes */}
      <ScrollView style={styles.restaurantList}>
        {filteredRestaurants.map(restaurant => (
          <TouchableOpacity
            key={restaurant.id}
            style={styles.restaurantItem}
            onPress={() => handleRestaurantPress(restaurant)}
          >
            <Image source={{ uri: restaurant.image }} style={styles.restaurantItemImage} />
            <View style={styles.restaurantItemInfo}>
              <Text style={styles.restaurantItemName}>{restaurant.name}</Text>
              <Text style={styles.restaurantItemMeta}>
                {restaurant.deliveryTime} • {restaurant.distance} • ⭐ {restaurant.rating}
              </Text>
            </View>
            <Text style={styles.restaurantItemArrow}>{'>'}</Text>
          </TouchableOpacity>
        ))}
        {filteredRestaurants.length === 0 && (
          <Text style={styles.noResultsText}>No restaurants found matching your criteria.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 20, // Espacio superior para el buscador
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  searchIconContainer: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 20,
    color: '#777',
  },
  categoryFiltersContainer: {
    marginBottom: 20,
    // Elimina el paddingHorizontal aquí para que el ScrollView maneje el espaciado
  },
  categoryScrollView: {
    paddingHorizontal: 10, // Espaciado dentro del scrollview
  },
  categoryButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 5,
  },
  activeCategoryButton: {
    backgroundColor: '#e91e63', // Color de acento
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  restaurantList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  restaurantItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  restaurantItemInfo: {
    flex: 1,
  },
  restaurantItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantItemMeta: {
    fontSize: 14,
    color: '#777',
  },
  restaurantItemArrow: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default RestaurantCatalogue;