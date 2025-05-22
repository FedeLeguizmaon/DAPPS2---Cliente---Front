import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItemQuantity } from '../store/actions/cartActions';
import { useNavigation } from '@react-navigation/native'; // Importar useNavigation de React Navigation


const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleIncreaseQuantity = () => {
    dispatch(updateCartItemQuantity(item.id, item.quantity + 1));
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      dispatch(updateCartItemQuantity(item.id, item.quantity - 1));
    }
  };

  const handleRemoveItem = () => {
    dispatch(removeFromCart(item.id));
  };

  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>£ {(item.price * item.quantity).toFixed(2)}</Text>
        {item.addons && Object.keys(item.addons).map(addonName => (
          <Text key={addonName} style={styles.addonText}>+ {addonName} (£{item.addons[addonName].toFixed(2)})</Text>
        ))}
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.quantityButton} onPress={handleDecreaseQuantity}>
          <Text>-</Text>
        </TouchableOpacity>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <TouchableOpacity style={styles.quantityButton} onPress={handleIncreaseQuantity}>
          <Text>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeItem} onPress={handleRemoveItem}>
        {/* Icono de lápiz */}
        <Text style={styles.editIcon}>✏️</Text>
        {/* Icono de "x" */}
        <Text style={styles.removeIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const Cart = () => { // Aquí cambiamos de ({ navigation }) a () porque usaremos el hook
  const cartItems = useSelector(state => state.cart.items);
  const cartTotal = useSelector(state => state.cart.total);
  const navigation = useNavigation(); // Usamos el hook useNavigation de @react-navigation/native

  const handlerCheckout = () => {
    navigation.navigate('Checkout'); // Usamos navigation.navigate para ir a Checkout
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Basket</Text>
        <TouchableOpacity style={styles.addItemsButton}>
          <Text style={styles.addItemsText}>Add Items</Text>
        </TouchableOpacity>
      </View>

      {/* Order Summary */}
      <Text style={styles.orderSummaryTitle}>Order Summary</Text>
      <ScrollView style={styles.cartItemsList}>
        {cartItems.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
        {cartItems.length === 0 && (
          <Text style={styles.emptyCartText}>Your basket is empty.</Text>
        )}
      </ScrollView>

      {/* Delivery and Payment */}
      <View style={styles.deliveryPaymentSection}>
        <TouchableOpacity style={styles.deliveryOption}>
          {/* Icono de ubicación */}
          <Text style={styles.icon}>📍</Text>
          <View>
            <Text style={styles.optionTitle}>Deliver to</Text>
            <Text style={styles.optionSubtitle}>Select Your Location</Text>
          </View>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption}>
          {/* Icono de tarjeta de crédito */}
          <Text style={styles.icon}>💳</Text>
          <View>
            <Text style={styles.optionTitle}>Payment method</Text>
            <Text style={styles.optionSubtitle}>Select Payment Method</Text>
          </View>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.promotionsOption}>
          {/* Icono de etiqueta de descuento */}
          <Text style={styles.icon}>🏷️</Text>
          <View>
            <Text style={styles.optionTitle}>Promotions</Text>
            <Text style={styles.optionSubtitle}>Select Your Discounts</Text>
          </View>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Subtotal and Total */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>£ {cartTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Delivery Fee</Text>
          <Text style={styles.totalValue}>—</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Discount</Text>
          <Text style={styles.totalValue}>—</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.finalTotalLabel}>Total</Text>
          <Text style={styles.finalTotalValue}>£ {cartTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarTotal}>£ {cartTotal.toFixed(2)}</Text>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlerCheckout}>
          <Text style={styles.placeOrderText}>Place Order</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50, // Ajuste para el StatusBar
    marginBottom: 15,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  addItemsButton: {
    backgroundColor: '#fdecea',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addItemsText: {
    color: '#e91e63',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginBottom: 10,
    color: '#333',
  },
  cartItemsList: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#e91e63',
  },
  addonText: {
    fontSize: 12,
    color: '#777',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  removeItem: {
    flexDirection: 'row',
  },
  editIcon: {
    color: '#e91e63',
    fontSize: 18,
    marginRight: 5,
  },
  removeIcon: {
    color: '#e91e63',
    fontSize: 18,
  },
  deliveryPaymentSection: {
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 15,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  promotionsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  icon: {
    fontSize: 20,
    color: '#e91e63',
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 'auto',
  },
  totalsContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    color: '#777',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bottomBarTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeOrderButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  placeOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Cart;