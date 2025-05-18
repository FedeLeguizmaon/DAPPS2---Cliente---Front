import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Si estás usando React Navigation

// Importa tus componentes (por ejemplo, para las ofertas especiales)
// import SpecialOfferCard from './components/SpecialOfferCard';

// Importa tus iconos (puedes usar bibliotecas como react-native-vector-icons)
// import Icon from 'react-native-vector-icons/FontAwesome';

function Home({ navigation }) {

  // Datos de ejemplo para las categorías (basado en los iconos que veo)
  const categories = [
    { name: 'Burger', icon: require('../assets/images/Cheese Burger.png') },
    { name: 'Taco', icon: require('../assets/images/taco.png') },
    { name: 'Burrito', icon: require('../assets/images/burrito.png') },
    { name: 'Drink', icon: require('../assets/images/drink.png') },
    { name: 'Pizza', icon: require('../assets/images/pizza.png') },
    { name: 'Donut', icon: require('../assets/images/donut.png') },
    { name: 'Salad', icon: require('../assets/images/salad.png') },
    { name: 'Noodles', icon: require('../assets/images/noodles.png') },
    { name: 'Sandwich', icon: require('../assets/images/sandwich.png') },
    { name: 'Pasta', icon: require('../assets/images/pasta.png') },
    { name: 'Ice Cream', icon: require('../assets/images/icecream.png') },
  ];

  // Datos de ejemplo para las ofertas especiales
  const specialOffers = [
    { id: 1, name: 'Mega Burger', image: require('../assets/images/Cheese Burger.png'), price: '$10.99' },
    { id: 2, name: 'Delicious Pizza', image: require('../assets/images/pizza.png'), price: '$15.50' },
    // ... más ofertas
  ];

  return (
    <View style={styles.container}>
      {/* Barra superior (Deliver to, Search, Filter) */}
      <View style={styles.topBar}>
        <View style={styles.locationContainer}>
          <Text style={styles.deliverToText}>Deliver to</Text>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationText}>Select Your Location</Text>
            {/* Puedes usar un icono aquí */}
            <Text style={styles.locationArrow}>▼</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          {/* Puedes usar un icono de carrito aquí */}
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Banner de promociones */}
      <ScrollView horizontal style={styles.bannerScrollView}>
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>GET YOUR SWEET ICE CREAM</Text>
          <Text style={styles.bannerDiscount}>40% OFF</Text>
          {/* Imagen de la promoción */}
          <Image
            source={require('../assets/images/icecream.png')} // Reemplaza con tu imagen
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
        {/* Puedes añadir más banners aquí */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>Another Great Offer</Text>
          <Text style={styles.bannerDiscount}>25% OFF</Text>
          {/* Otra imagen de promoción */}
        </View>
      </ScrollView>

      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        {/* Puedes usar un icono de lupa aquí */}
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food or restaurants"
        />
        {/* Puedes añadir un icono de filtro aquí */}
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity key={index} style={styles.categoryButton}>
            <Image source={category.icon} style={styles.categoryIcon} resizeMode="contain" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sección de ofertas especiales */}
      <View style={styles.specialOffersSection}>
        <View style={styles.specialOffersHeader}>
          <Text style={styles.specialOffersTitle}>Special Offers</Text>
          <TouchableOpacity onPress={() => console.log('View All Offers')}>
            <Text style={styles.viewAllText}>View All {'>'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal>
          {specialOffers.map((offer) => (
            <TouchableOpacity key={offer.id} style={styles.specialOfferCard}>
              <Image source={offer.image} style={styles.specialOfferImage} resizeMode="cover" />
              <View style={styles.specialOfferDetails}>
                <Text style={styles.specialOfferName}>{offer.name}</Text>
                <Text style={styles.specialOfferPrice}>{offer.price}</Text>
              </View>
              {/* Puedes añadir un botón de "Me gusta" aquí */}
              <TouchableOpacity style={styles.likeButton}>
                <Text>❤️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNavigationBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateToScreen('Home')}>
          {/* Icono de Home */}
          <View style={styles.activeNavIcon}>
            <Text style={styles.activeNavText}>🏠</Text>
          </View>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Orders')}>
          {/* Icono de Lista/Pedidos */}
          <Text style={styles.navIcon}>📄</Text>
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          {/* Icono de Corazón/Favoritos */}
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications')}>
          {/* Icono de Campana/Notificaciones */}
          <Text style={styles.navIcon}>🔔</Text>
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          {/* Icono de Usuario/Perfil */}
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 10,
  },
  locationContainer: {
    flex: 1,
  },
  deliverToText: {
    fontSize: 12,
    color: '#666',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  locationArrow: {
    fontSize: 14,
    color: '#e91e63', // Un color similar al de la referencia
  },
  cartButton: {
    padding: 10,
    // Estilos para el icono del carrito
  },
  cartIcon: {
    fontSize: 24,
  },
  bannerScrollView: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  bannerCard: {
    backgroundColor: '#ffe082', // Un color similar al del banner
    borderRadius: 10,
    width: 300, // Ancho aproximado
    height: 150, // Alto aproximado
    marginRight: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    flex: 1,
  },
  bannerDiscount: {
    fontSize: 20,
    color: '#e91e63',
    fontWeight: 'bold',
  },
  bannerImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 20,
    color: '#666',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  filterButton: {
    padding: 10,
    // Estilos para el botón de filtro
  },
  filterIcon: {
    fontSize: 16,
    color: '#007bff',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  categoryButton: {
    width: '20%', // Ajusta según sea necesario
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryIcon: {
    width: 40,
    height: 40,
  },
  categoryText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  specialOffersSection: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  specialOffersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  specialOffersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#e91e63',
    fontSize: 16,
  },
  specialOfferCard: {
    width: 200, // Ancho aproximado de la tarjeta
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
    padding: 10,
  },
  specialOfferImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  specialOfferDetails: {
    // Estilos para el nombre y precio
  },
  specialOfferName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialOfferPrice: {
    fontSize: 14,
    color: '#666',
  },
  likeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
    // Estilos para el botón de "Me gusta"
  },
  bottomNavigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: '#666',
  },
  activeNavIcon: {
    fontSize: 24,
    color: '#e91e63',
  },
  navText: {
    fontSize: 12,
    color: '#666',
  },
  activeNavText: {
    fontSize: 24,
    color: '#e91e63',
  },
});

export default Home;