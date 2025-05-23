import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, StatusBar, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Importamos useRoute

function RestaurantCatalogue() {
  const route = useRoute(); // Usamos useRoute para acceder a los parámetros
  const navigation = useNavigation(); // Usamos useNavigation para navegar

  // Datos de restaurantes de ejemplo (puedes expandirlos)
  const allRestaurants = [
    {
      id: 'r1',
      name: 'Burger Joint',
      image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=BurgerJoint',
      deliveryTime: '20-30 min',
      distance: '1.2 km',
      rating: 4.5,
      categories: ['Burger', 'Fries', 'Drinks'],
      // Esto es importante para el Restaurant.jsx
      fullData: {
        id: 'r1',
        name: 'Burger Joint',
        image: 'https://via.placeholder.com/100/FF0000/FFFFFF?text=Restaurante',
        deliveryTime: '20-30 min',
        distance: '1.2 km',
        categories: [
          {
            name: 'Burgers',
            products: [
              { id: 'b1', name: 'Classic Burger', originalPrice: 12, currentPrice: 8.5, rating: 4.5, reviews: 800, image: 'https://via.placeholder.com/300x200?text=ClasicBurger', description: 'Our signature classic burger.' },
              { id: 'b2', name: 'Cheese Burger', originalPrice: 13, currentPrice: 9.0, rating: 4.6, reviews: 750, image: 'https://via.placeholder.com/300x200?text=CheeseBurger', description: 'Delicious cheeseburger with cheddar.' },
            ],
          },
          {
            name: 'Sides',
            products: [
              { id: 's1', name: 'French Fries', originalPrice: 4, currentPrice: 3.5, rating: 4.7, reviews: 1000, image: 'https://via.placeholder.com/300x200?text=Fries', description: 'Crispy golden fries.' },
            ],
          },
        ],
      },
    },
    {
      id: 'r2',
      name: 'Pizza Palace',
      image: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=PizzaPalace',
      deliveryTime: '30-40 min',
      distance: '3.5 km',
      rating: 4.2,
      categories: ['Pizza', 'Italian', 'Drinks'],
      fullData: {
        id: 'r2',
        name: 'Pizza Palace',
        image: 'https://via.placeholder.com/100/00FF00/FFFFFF?text=PizzaRest',
        deliveryTime: '30-40 min',
        distance: '3.5 km',
        categories: [
          {
            name: 'Pizzas',
            products: [
              { id: 'p1', name: 'Pepperoni Pizza', originalPrice: 18, currentPrice: 15.0, rating: 4.2, reviews: 600, image: 'https://via.placeholder.com/300x200?text=Pepperoni', description: 'Classic pepperoni pizza.' },
              { id: 'p2', name: 'Margarita Pizza', originalPrice: 16, currentPrice: 13.0, rating: 4.0, reviews: 500, image: 'https://via.placeholder.com/300x200?text=Margarita', description: 'Traditional margarita pizza.' },
            ],
          },
        ],
      },
    },
    {
      id: 'r3',
      name: 'Taco Haven',
      image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=TacoHaven',
      deliveryTime: '15-25 min',
      distance: '0.8 km',
      rating: 4.8,
      categories: ['Taco', 'Mexican', 'Burrito'],
      fullData: {
        id: 'r3',
        name: 'Taco Haven',
        image: 'https://via.placeholder.com/100/0000FF/FFFFFF?text=TacoRest',
        deliveryTime: '15-25 min',
        distance: '0.8 km',
        categories: [
          {
            name: 'Tacos',
            products: [
              { id: 't1', name: 'Carnitas Taco', originalPrice: 6, currentPrice: 4.5, rating: 4.8, reviews: 900, image: 'https://via.placeholder.com/300x200?text=Carnitas', description: 'Authentic carnitas taco.' },
            ],
          },
        ],
      },
    },
    {
      id: 'r4',
      name: 'Salad Spot',
      image: 'https://via.placeholder.com/150/FFFF00/000000?text=SaladSpot',
      deliveryTime: '20-30 min',
      distance: '2.0 km',
      rating: 4.0,
      categories: ['Salad', 'Healthy', 'Vegan'],
      fullData: {
        id: 'r4',
        name: 'Salad Spot',
        image: 'https://via.placeholder.com/100/FFFF00/000000?text=SaladRest',
        deliveryTime: '20-30 min',
        distance: '2.0 km',
        categories: [
          {
            name: 'Salads',
            products: [
              { id: 'sa1', name: 'Caesar Salad', originalPrice: 10, currentPrice: 8.0, rating: 4.0, reviews: 300, image: 'https://via.placeholder.com/300x200?text=Caesar', description: 'Fresh Caesar salad.' },
            ],
          },
        ],
      },
    },
    {
      id: 'r5',
      name: 'Sweet Tooth',
      image: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=SweetTooth',
      deliveryTime: '25-35 min',
      distance: '4.0 km',
      rating: 4.7,
      categories: ['Donut', 'Dessert', 'Ice Cream'],
      fullData: {
        id: 'r5',
        name: 'Sweet Tooth',
        image: 'https://via.placeholder.com/100/FF00FF/FFFFFF?text=DessertRest',
        deliveryTime: '25-35 min',
        distance: '4.0 km',
        categories: [
          {
            name: 'Desserts',
            products: [
              { id: 'd1', name: 'Chocolate Donut', originalPrice: 4, currentPrice: 3.0, rating: 4.7, reviews: 200, image: 'https://via.placeholder.com/300x200?text=Donut', description: 'Rich chocolate donut.' },
              { id: 'd2', name: 'Vanilla Ice Cream', originalPrice: 5, currentPrice: 4.0, rating: 4.5, reviews: 150, image: 'https://via.placeholder.com/300x200?text=IceCream', description: 'Creamy vanilla ice cream.' },
            ],
          },
        ],
      },
    },
    {
      id: 'r6',
      name: 'Noodle Nirvana',
      image: 'https://via.placeholder.com/150/00FFFF/000000?text=NoodleNirvana',
      deliveryTime: '20-30 min',
      distance: '1.5 km',
      rating: 4.4,
      categories: ['Noodles', 'Asian', 'Pasta'],
      fullData: {
        id: 'r6',
        name: 'Noodle Nirvana',
        image: 'https://via.placeholder.com/100/00FFFF/000000?text=NoodleRest',
        deliveryTime: '20-30 min',
        distance: '1.5 km',
        categories: [
          {
            name: 'Noodles',
            products: [
              { id: 'n1', name: 'Pad Thai', originalPrice: 15, currentPrice: 12.0, rating: 4.4, reviews: 400, image: 'https://via.placeholder.com/300x200?text=PadThai', description: 'Classic Pad Thai noodles.' },
            ],
          },
        ],
      },
    },
    {
      id: 'r7',
      name: 'Sandwich Spot',
      image: 'https://via.placeholder.com/150/800080/FFFFFF?text=SandwichSpot',
      deliveryTime: '10-20 min',
      distance: '0.5 km',
      rating: 4.6,
      categories: ['Sandwich'],
      fullData: {
        id: 'r7',
        name: 'Sandwich Spot',
        image: 'https://via.placeholder.com/100/800080/FFFFFF?text=SandwichRest',
        deliveryTime: '10-20 min',
        distance: '0.5 km',
        categories: [
          {
            name: 'Sandwiches',
            products: [
              { id: 'sa2', name: 'Club Sandwich', originalPrice: 11, currentPrice: 9.0, rating: 4.6, reviews: 350, image: 'https://via.placeholder.com/300x200?text=ClubSandwich', description: 'Triple decker club sandwich.' },
            ],
          },
        ],
      },
    },
  ];

  // Obtén la categoría seleccionada de los parámetros de la ruta.
  // Usa el operador de encadenamiento opcional `?.` para evitar el error si `route.params` es undefined.
  // Si `route.params?.selectedCategory` es undefined, `defaultCategory` será 'All'.
  const defaultCategory = 'All'; // Categoría por defecto si no se pasa ninguna
  const initialCategory = route.params?.selectedCategory || defaultCategory;

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    filterRestaurants();
  }, [selectedCategory, searchQuery]); // Re-filtrar cuando la categoría o la búsqueda cambian

  // Esta función se activará cuando la pantalla reciba nuevos parámetros
  // (es decir, cuando navegas desde Home con una nueva categoría).
  useEffect(() => {
    if (route.params?.selectedCategory && route.params.selectedCategory !== selectedCategory) {
      setSelectedCategory(route.params.selectedCategory);
    }
  }, [route.params?.selectedCategory]);


  const filterRestaurants = () => {
    let tempRestaurants = allRestaurants;

    // Filtrar por categoría
    if (selectedCategory !== 'All') {
      tempRestaurants = tempRestaurants.filter(restaurant =>
        restaurant.categories.includes(selectedCategory)
      );
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      tempRestaurants = tempRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(lowerCaseQuery) ||
        restaurant.categories.some(cat => cat.toLowerCase().includes(lowerCaseQuery))
      );
    }

    setFilteredRestaurants(tempRestaurants);
  };

  const handleRestaurantPress = (restaurant) => {
    // Asegúrate de pasar el objeto 'fullData' del restaurante para la pantalla Restaurant.jsx
    navigation.navigate('Restaurant', { restaurant: restaurant.fullData });
  };

  // Puedes definir las categorías aquí si quieres que sean dinámicas o si las tienes centralizadas
  const categories = [
    { name: 'All', icon: '✨' }, // Agregamos "All" para ver todos los restaurantes
    { name: 'Burger', icon: '🍔' },
    { name: 'Taco', icon: '🌮' },
    { name: 'Burrito', icon: '🌯' },
    { name: 'Drink', icon: '🥤' },
    { name: 'Pizza', icon: '🍕' },
    { name: 'Donut', icon: '🍩' },
    { name: 'Salad', icon: '🥗' },
    { name: 'Noodles', icon: '🍜' },
    { name: 'Sandwich', icon: '🥪' },
    { name: 'Pasta', icon: '🍝' },
    { name: 'Ice Cream', icon: '🍦' },
  ];


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurants</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for restaurants"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Categorías Horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorySelector}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryPill,
              selectedCategory === cat.name && styles.selectedCategoryPill,
            ]}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === cat.name && styles.selectedCategoryPillText,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Restaurantes */}
      <ScrollView style={styles.restaurantList}>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => handleRestaurantPress(restaurant)}
            >
              <Image source={{ uri: restaurant.image }} style={styles.restaurantCardImage} />
              <View style={styles.restaurantCardInfo}>
                <Text style={styles.restaurantCardName}>{restaurant.name}</Text>
                <View style={styles.restaurantCardMeta}>
                  <Text style={styles.restaurantCardDeliveryTime}>
                    {restaurant.deliveryTime}
                  </Text>
                  <Text style={styles.restaurantCardDistance}>
                    {restaurant.distance}
                  </Text>
                  <View style={styles.restaurantCardRating}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noRestaurantsText}>No se encontraron restaurantes para esta categoría o búsqueda.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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