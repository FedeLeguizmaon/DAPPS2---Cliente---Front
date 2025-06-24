import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function Home({ }) {
  const navigation = useNavigation();
  // Datos de ejemplo para las categorías (basado en los iconos que veo)
  const categories = [
    { name: 'Hamburguesa', icon: require('../assets/images/Cheese Burger.png') },
    { name: 'Taco', icon: require('../assets/images/taco.png') },
    { name: 'Burrito', icon: require('../assets/images/burrito.png') },
    { name: 'Bebida', icon: require('../assets/images/drink.png') },
    { name: 'Pizza', icon: require('../assets/images/pizza.png') },
    { name: 'Donut', icon: require('../assets/images/donut.png') },
    { name: 'Ensalada', icon: require('../assets/images/salad.png') },
    { name: 'Fideos', icon: require('../assets/images/noodles.png') },
    { name: 'Sándwich', icon: require('../assets/images/sandwich.png') },
    { name: 'Pasta', icon: require('../assets/images/pasta.png') },
    { name: 'Helado', icon: require('../assets/images/icecream.png') },
    { name: 'Más', icon: null }, 
  ];

  // Datos de ejemplo para las ofertas especiales
  const specialOffers = [
    { id: 1, name: 'Mega Hamburguesa', image: require('../assets/images/Cheese Burger.png'), price: '$10.99' },
    { id: 2, name: 'Pizza Deliciosa', image: require('../assets/images/pizza.png'), price: '$15.50' },
    { id: 3, name: 'Ensalada Fresca', image: require('../assets/images/salad.png'), price: '$8.00' },
    { id: 4, name: 'Fideos Picantes', image: require('../assets/images/noodles.png'), price: '$12.50' },
    // Agregamos más ofertas para asegurar que haya suficiente contenido para desplazar
    { id: 5, name: 'Wrap Vegano', image: require('../assets/images/burrito.png'), price: '$9.50' },
  ];


  // Función para manejar la navegación desde la barra de búsqueda
  const handleSearchPress = () => {
    navigation.navigate('RestaurantCatalogue', { selectedCategory: 'All' });
  };

  // Función para manejar la navegación al tocar una categoría
  const handleCategoryPress = (categoryName) => {
    navigation.navigate('RestaurantCatalogue', { selectedCategory: categoryName });
  };

  return (
    <View style={styles.fullScreenContainer}> {/* Contenedor principal que usa flex: 1 */}
      {/* Agregamos el componente StatusBar para manejar la barra superior del teléfono */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={styles.scrollViewContent}> {/* Aplica paddingBottom aquí */}
        {/* Barra superior (Deliver to, Search, Filter) */}
        <View style={styles.topBar}>
          <View style={styles.locationContainer}>
            <Text style={styles.deliverToText}>Entregar en</Text>
            <TouchableOpacity style={styles.locationButton}>
              <Text style={styles.locationText}>Seleccione su ubicacion</Text>
              <Text style={styles.locationArrow}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.topBarButtons}>
            <TouchableOpacity style={styles.walletButton} onPress={() => navigation.navigate('Wallet')}>
              <Text style={styles.walletIcon}>💰</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
              <Text style={styles.cartIcon}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner de promociones - Ajuste en height y padding */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerScrollViewContent}>
          <View style={[styles.bannerCard, { backgroundColor: '#ffe082' }]}>
            <View style={styles.bannerTextContent}>
              <Text style={styles.bannerTitle}>DIA DE HELADO</Text>
              <Text style={styles.bannerSecondaryTitle}>COMPRE AHORA</Text>
              <Text style={styles.bannerPrimaryTitle}>HELADO</Text>
              <Text style={styles.bannerDiscount}>40% OFF</Text>
            </View>
            <Image
              source={require('../assets/images/icecream.png')}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>

          {/* Nuevo banner para la billetera */}
          <View style={[styles.bannerCard, { backgroundColor: '#e8f5e8' }]}>
            <View style={styles.bannerTextContent}>
              <Text style={styles.bannerTitle}>G7 WALLET</Text>
              <Text style={styles.bannerSecondaryTitle}>CARGA SALDO</Text>
              <Text style={styles.bannerPrimaryTitle}>COMPRA CRYPTO</Text>
              <TouchableOpacity
                style={styles.walletBannerButton}
                onPress={() => navigation.navigate('Wallet')}
              >
                <Text style={styles.walletBannerButtonText}>Ir a Billetera</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.bannerWalletIcon}>💰</Text>
          </View>

          <View style={[styles.bannerCard, { backgroundColor: '#FFD700' }]}>
            <View style={styles.bannerTextContent}>
              <Text style={styles.bannerTitle}>Ofertas Deliciosas</Text>
              <Text style={styles.bannerSecondaryTitle}>COMPRE AHORA</Text>
              <Text style={styles.bannerPrimaryTitle}>GRANDES DESCUENTOS</Text>
              <Text style={styles.bannerDiscount}>25% OFF</Text>
            </View>
            <Image
              source={require('../assets/images/donut.png')}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>
        </ScrollView>

        {/* Barra de búsqueda - Ahora redirige al RestaurantCatalogue */}
        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food or restaurants"
            editable={false}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Categorías - Ahora redirigen al RestaurantCatalogue */}
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryButton} onPress={() => handleCategoryPress(category.name)}>
              {category.icon ? (
                <Image source={category.icon} style={styles.categoryIcon} resizeMode="contain" />
              ) : (
                <View style={styles.categoryIconPlaceholder}>
                  <Text style={styles.categoryIconText}>+</Text>
                </View>
              )}
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección de ofertas especiales */}
        <View style={styles.specialOffersSection}>
          <View style={styles.specialOffersHeader}>
            <Text style={styles.specialOffersTitle}>Ofertas Especiales</Text>
            <TouchableOpacity onPress={() => console.log('View All Offers')}>
             <Text style={styles.viewAllText}>Ver más ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specialOffersScrollViewContent}>
            {specialOffers.map((offer) => (
              <TouchableOpacity key={offer.id} style={styles.specialOfferCard}>
                <Image source={offer.image} style={styles.specialOfferImage} resizeMode="cover" />
                <View style={styles.specialOfferDetails}>
                  <Text style={styles.specialOfferName}>{offer.name}</Text>
                  <Text style={styles.specialOfferPrice}>{offer.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>



      </ScrollView>

      {/* Barra de navegación inferior (permanece fuera del ScrollView y absoluto) */}
      <View style={styles.bottomNavigationBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <View style={styles.activeNavIconBg}>
            <Text style={styles.activeNavIcon}>🏠</Text>
          </View>
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.navIcon}>📄</Text>
          <Text style={styles.navText}>Pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Wallet')}>
          <Text style={styles.navIcon}>💰</Text>
          <Text style={styles.navText}>Billetera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.navIcon}>🔔</Text>
          <Text style={styles.navText}>Notificaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          {/* ✅ SOLUCION 2: Reemplazamos la imagen problemática */}
          <View style={styles.profileNavIconPlaceholder}>
            <Text style={styles.profileNavIconText}>👤</Text>
          </View>
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: { // Nuevo contenedor principal
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: { // Estilo para el contentContainerStyle del ScrollView
    paddingBottom: 80, // Ajusta este valor para que el contenido no quede debajo de la barra de navegación
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50, // Ajuste para el statusBar
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
    color: '#333',
  },
  locationArrow: {
    fontSize: 14,
    color: '#e91e63',
  },
  topBarButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  walletButton: {
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  walletIcon: {
    fontSize: 24,
  },
  cartButton: {
    padding: 10,
  },
  cartIcon: {
    fontSize: 24,
    color: '#333',
  },
  bannerScrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  bannerCard: {
    borderRadius: 10,
    width: 300,
    height: 150,
    marginRight: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerTextContent: {
    flex: 1,
    marginRight: 10,
  },
  bannerTitle: {
    fontSize: 14,
    color: '#333',
  },
  bannerSecondaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerPrimaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 5,
  },
  bannerDiscount: {
    fontSize: 18,
    color: '#e91e63',
    fontWeight: 'bold',
  },
  bannerImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  walletBannerButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 5,
  },
  walletBannerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerWalletIcon: {
    fontSize: 60,
    opacity: 0.3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 20,
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 5,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  categoryButton: {
    width: '24%',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
  },
  categoryIcon: {
    width: 45,
    height: 45,
    marginBottom: 5,
  },

  categoryIconPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryIconText: {
    fontSize: 24,
    color: '#777',
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    color: '#333',
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
    color: '#333',
  },
  viewAllText: {
    color: '#e91e63',
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialOffersScrollViewContent: {
    paddingBottom: 10,
  },
  specialOfferCard: {
    width: 180,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginRight: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  specialOfferImage: {
    width: '50%',
    height: 75,
    borderRadius: 8,
  },
  specialOfferDetails: {
    flex: 1,
    paddingHorizontal: 2,
  },
  specialOfferName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  specialOfferPrice: {
    fontSize: 13,
    color: '#777',
  },
  likeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 16,
    color: '#e91e63',
  },
  bottomNavigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navIcon: {
    fontSize: 22,
    color: '#666',
    marginBottom: 4,
  },
  activeNavIconBg: {
    backgroundColor: '#fdecea',
    borderRadius: 20,
    padding: 8,
    marginBottom: 4,
  },
  activeNavIcon: {
    fontSize: 22,
    color: '#e91e63',
  },
  navText: {
    fontSize: 10,
    color: '#666',
  },
  // ✅ SOLUCION 2: Nuevos estilos para el placeholder del perfil
  profileNavIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileNavIconText: {
    fontSize: 16,
    color: '#666',
  },
});export default Home;