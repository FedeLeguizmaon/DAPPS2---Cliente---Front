import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Switch } from 'react-native'; // Agregamos Switch para las opciones adicionales
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/actions/cartActions'; // Importa la acción para añadir al carrito
import { useNavigation } from '@react-navigation/native'; // Importa el hook de navegación

function Product({ route }) {
  // Validación del producto inicial
  const defaultProduct = {
    id: 'default_product',
    name: 'Producto',
    originalPrice: 0.00,
    currentPrice: 0.00,
    rating: 0,
    reviews: 0,
    image: 'https://via.placeholder.com/300x200',
    description: 'Descripción del producto',
    additionalOptions: []
  };

  // El producto se pasaría a través de las props de navegación (route.params.product)
  const { product: initialProduct } = route.params || { product: defaultProduct };

  // Asegurarnos de que el producto tenga todos los campos necesarios
  const product = {
    ...defaultProduct,
    ...initialProduct,
    additionalOptions: initialProduct.additionalOptions || []
  };

  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState({});
  const navigation = useNavigation();

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddonToggle = (addonId, addonPrice) => {
    setSelectedAddons(prevAddons => {
      const newAddons = { ...prevAddons };
      if (newAddons[addonId]) {
        delete newAddons[addonId];
      } else {
        newAddons[addonId] = addonPrice;
      }
      return newAddons;
    });
  };

  const calculateTotalPrice = () => {
    let price = product.currentPrice * quantity;
    for (const addonId in selectedAddons) {
      price += selectedAddons[addonId];
    }
    return price;
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: product.currentPrice, // El precio base del ítem
      quantity: quantity,
      image: product.image,
      // Incluir addons seleccionados en el item del carrito
      addons: Object.keys(selectedAddons).reduce((acc, addonId) => {
        const addon = product.additionalOptions.find(opt => opt.id === addonId);
        if (addon) {
          acc[addon.name] = addon.price; // Guardamos el nombre y precio del addon
        }
        return acc;
      }, {}),
    };
    dispatch(addToCart(itemToAdd));
    navigation.goBack(); // O navegar al carrito, o mostrar un mensaje de éxito
    console.log('Added to cart:', itemToAdd);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            {/* Icono de corazón */}
            <Text style={styles.favoriteIcon}>❤️</Text>
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>$ {product.originalPrice.toFixed(2)}</Text>
            <Text style={styles.currentPrice}>$ {product.currentPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingValue}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviews})</Text>
            <TouchableOpacity onPress={() => console.log('See all reviews')}>
              <Text style={styles.seeAllReviews}>Ver todas las reseñas</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.productDescription}>
            {product.description}
          </Text>
          <TouchableOpacity onPress={() => console.log('See more description')}>
            <Text style={styles.seeMore}>Ver más</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Opciones adicionales :</Text>
          {(product.additionalOptions || []).map((option) => (
            <View key={option.id} style={styles.optionItem}>
              <Text style={styles.optionName}>{option.name}</Text>
              <Text style={styles.optionPrice}>+ ${option.price.toFixed(2)}</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#e91e63' }}
                thumbColor={selectedAddons[option.id] ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => handleAddonToggle(option.id, option.price)}
                value={!!selectedAddons[option.id]}
                style={styles.optionSwitch}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Bar (Quantity and Add to Basket) */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity style={styles.quantityButton} onPress={handleDecreaseQuantity}>
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={handleIncreaseQuantity}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addToBasketButton} onPress={handleAddToCart}>
          {/* Icono de cesta */}
          <Text style={styles.basketIcon}>🛒</Text>
          <Text style={styles.addToBasketText}>Agregar al carrito</Text>
          <Text style={styles.totalPriceText}>£ {calculateTotalPrice().toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingBottom: 100, // Espacio para la barra inferior fija
  },
  imageContainer: {
    width: '100%',
    height: 250, // Altura de la imagen
    position: 'relative',
    backgroundColor: '#eee', // Color de fondo para cuando la imagen carga
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#e91e63', // Corazón rojo
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -20, // Superponer ligeramente sobre la imagen
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingStar: {
    fontSize: 18,
    color: '#ffc107',
    marginRight: 5,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: '#777',
    marginRight: 15,
  },
  seeAllReviews: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 10,
  },
  seeMore: {
    fontSize: 16,
    color: '#e91e63',
    fontWeight: 'bold',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionName: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  optionPrice: {
    fontSize: 16,
    color: '#e91e63',
    marginRight: 10,
  },
  optionSwitch: {
    // Estilos del switch (puede necesitar ajuste en iOS/Android)
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 5,
  },
  quantityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#333',
  },
  addToBasketButton: {
    flexDirection: 'row',
    backgroundColor: '#e91e63',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  basketIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 10,
  },
  addToBasketText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
  totalPriceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Product;