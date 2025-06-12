import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Componente para seleccionar la calificación (podría ser un modal o una pantalla separada)
const RatingModal = ({ visible, currentRating, onRate, onClose }) => {
  const [selectedRating, setSelectedRating] = useState(currentRating);

  // Sincroniza el selectedRating con el currentRating cuando el modal se abre o el currentRating cambia
  React.useEffect(() => {
    setSelectedRating(currentRating);
  }, [currentRating]);

  const handleSave = () => {
    onRate(selectedRating);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>Calificar Pedido</Text>
            <View style={modalStyles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <TouchableOpacity key={starValue} onPress={() => setSelectedRating(starValue)}>
                        <Icon
                            name={starValue <= selectedRating ? 'star' : 'star-o'}
                            size={30}
                            color={starValue <= selectedRating ? '#ffc107' : '#ccc'}
                            style={{ marginHorizontal: 5 }}
                        />
                    </TouchableOpacity>
                ))}
            </View>

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.buttonClose]}
              onPress={onClose}
            >
              <Text style={modalStyles.textStyle}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.buttonSave]}
              onPress={handleSave}
            >
              <Text style={modalStyles.textStyle}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


// Componente para mostrar la información de un pedido individual
const OrderItem = ({ order, onRatePress }) => {
  // Estado local para el efecto de "presionado" en las estrellas
  const [isRatingPressed, setIsRatingPressed] = useState(false);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return styles.activeStatus;
      case 'completado':
        return styles.completedStatus;
      case 'cancelado':
        return styles.cancelledStatus;
      default:
        return styles.defaultStatus;
    }
  };

  const handlePressIn = () => {
    setIsRatingPressed(true);
  };

  const handlePressOut = () => {
    setIsRatingPressed(false);
    onRatePress(order.id, order.rating); // Llama a la función para abrir el modal después de soltar
  };

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderImageContainer}>
        <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.orderImage} />
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>Pedido ID : {order.id}</Text>
        {/* Muestra el subprecio tachado y en gris */}
        {order.subprice && order.subprice > order.price && (
          <Text style={styles.originalPriceText}>$ {order.subprice.toFixed(2)}</Text>
        )}
        <Text style={styles.orderPrice}>$ {order.price.toFixed(2)}</Text>
        {/* Aquí convertimos las estrellas en un botón */}
        <TouchableOpacity
          onPressIn={handlePressIn} // Cuando se presiona
          onPressOut={handlePressOut} // Cuando se suelta
          style={styles.ratingButton}
          disabled={order.status.toLowerCase() !== 'completado'} // Solo se puede calificar si está completado
          activeOpacity={1} // Desactiva la opacidad por defecto de TouchableOpacity
        >
          <View style={styles.rating}>
            {[1, 2, 3, 4, 5].map((starValue) => (
              // Condición para el color de la estrella basado en el rating y si está presionado
              // Si usas react-native-vector-icons:
              <Icon
                key={starValue}
                name={starValue <= order.rating ? 'star' : 'star-o'}
                size={16}
                color={isRatingPressed && starValue <= order.rating ? '#ff9800' : // Amarillo más oscuro al presionar
                               isRatingPressed && starValue > order.rating ? '#b0b0b0' : // Gris más oscuro al presionar
                               starValue <= order.rating ? '#ffc107' : '#ccc'} // Colores normales
                style={{ marginHorizontal: 1 }}
              />
              /* Si no usas react-native-vector-icons y estás con emojis:
              <Text
                key={starValue}
                style={[
                  starValue <= order.rating ? styles.star : styles.emptyStar,
                  isRatingPressed && { color: starValue <= order.rating ? '#ff9800' : '#b0b0b0' } // Cambia el color al presionar
                ]}
              >
                ⭐
              </Text>
              */
            ))}
            {order.status.toLowerCase() === 'completado' && (
              <Text style={styles.rateNowText}>Calificar ahora</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.orderStatusContainer}>
        <Text style={[styles.orderStatus, getStatusStyle(order.status)]}>{order.status}</Text>
      </View>
    </View>
  );
};

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  const [orders, setOrders] = useState([
    { id: 'SP 0023900', price: 20.00, subprice: 25.00, rating: 0, status: 'Activo' },
    { id: 'SP 0023512', price: 40.00, subprice: 40.00, rating: 4, status: 'Completado' }, // Este tendrá 4 estrellas pintadas
    { id: 'SP 0023502', price: 75.00, subprice: 85.00, rating: 0, status: 'Completado' }, // Este se podrá calificar
    { id: 'SP 0023450', price: 20.50, subprice: 20.50, rating: 2, status: 'Cancelado' }, // Este tendrá 2 estrellas, pero no se podrá calificar (disabled)
    // ... más pedidos
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [initialRatingForModal, setInitialRatingForModal] = useState(0);

  /*
  const fetchOrders = async () => {
    try {
      const response = await fetch('https://api.example.com/orders'); // Reemplaza con tu URL de API
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "No se pudieron cargar los pedidos. Inténtalo más tarde.");
    }
  }
  */

  const handleRateOrderPress = (orderId, currentRating) => {
    setSelectedOrderId(orderId);
    setInitialRatingForModal(currentRating);
    setModalVisible(true);
  };

  const handleRatingSubmit = (newRating) => {
    // Aquí actualizas el estado del pedido con la nueva calificación
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === selectedOrderId ? { ...order, rating: newRating } : order
      )
    );
    // Aquí es donde enviarías la calificación a tu backend
    Alert.alert("Calificación Guardada", `Has calificado el pedido ${selectedOrderId} con ${newRating} estrellas.`);
    setSelectedOrderId(null);
  };

  const filteredOrders = orders.filter(order => {
    const searchMatch = order.id.toLowerCase().includes(searchText.toLowerCase());
    const filterMatch = activeFilter === 'Todos' || order.status.toLowerCase() === activeFilter.toLowerCase();
    return searchMatch && filterMatch;
  });

  const handleFilterPress = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <View style={styles.container}>
      {/* Comenta esta llamada a la función hasta que tengas el endpoint de la API */}
      {/* {fetchOrders()} */}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pedidos</Text>
        <View style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity
          style={[styles.filterButtonTab, activeFilter === 'Todos' && styles.activeFilterTab]}
          onPress={() => handleFilterPress('Todos')}
        >
          <Text style={[styles.filterButtonText, activeFilter === 'Todos' && styles.activeFilterText]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButtonTab, activeFilter === 'Activo' && styles.activeFilterTab]}
          onPress={() => handleFilterPress('Activo')}
        >
          <Text style={[styles.filterButtonText, activeFilter === 'Activo' && styles.activeFilterText]}>Activos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButtonTab, activeFilter === 'Completado' && styles.activeFilterTab]}
          onPress={() => handleFilterPress('Completado')}
        >
          <Text style={[styles.filterButtonText, activeFilter === 'Completado' && styles.activeFilterText]}>Completados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButtonTab, activeFilter === 'Cancelado' && styles.activeFilterTab]}
          onPress={() => handleFilterPress('Cancelado')}
        >
          <Text style={[styles.filterButtonText, activeFilter === 'Cancelado' && styles.activeFilterText]}>Cancelados</Text>
        </TouchableOpacity>
      </View>

      {/* Order List */}
      <ScrollView style={styles.orderList}>
        {filteredOrders.map((order) => (
          <OrderItem
            key={order.id}
            order={order}
            onRatePress={handleRateOrderPress} // Pasa la función para manejar la pulsación
          />
        ))}
        {filteredOrders.length === 0 && (
          <Text style={styles.noOrdersText}>No se han encontrado pedidos con los filtros actuales.</Text>
        )}
      </ScrollView>

      {/* Modal de Calificación */}
      <RatingModal
        visible={modalVisible}
        currentRating={initialRatingForModal}
        onRate={handleRatingSubmit}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 40, // Ajuste para StatusBar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
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
  filterButton: {
    padding: 10,
  },
  filterIcon: {
    fontSize: 24,
    color: '#333',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 20,
    color: '#777',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  filterButtonTab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeFilterTab: {
    backgroundColor: '#e91e63', // Un color similar al diseño
  },
  filterButtonText: {
    fontSize: 16,
    color: '#555',
  },
  activeFilterText: {
    color: '#fff',
  },
  orderList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  orderImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
  },
  orderImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  // Estilo para el precio con descuento
  orderPrice: {
    fontSize: 16, // Aumenta el tamaño para que se vea más prominente
    fontWeight: 'bold',
    color: '#e91e63', // Color distintivo para el precio actual
    marginBottom: 5,
  },
  // Nuevo estilo para el subprecio (original)
  originalPriceText: {
    fontSize: 14,
    color: '#888', // Un gris para el precio tachado
    textDecorationLine: 'line-through', // Para tachar el texto
    marginBottom: 2, // Pequeño margen para separarlo del precio con descuento
  },
  ratingButton: { // Nuevo estilo para el TouchableOpacity
    paddingVertical: 5,
    paddingRight: 10,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 16,
    color: '#ffc107', // Estrellas llenas
  },
  emptyStar: {
    fontSize: 16,
    color: '#ccc', // Estrellas vacías (grises)
  },
  rateNowText: {
    fontSize: 14,
    color: '#e91e63',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  orderStatusContainer: {
    marginLeft: 10,
  },
  orderStatus: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  activeStatus: {
    backgroundColor: '#4caf50',
  },
  completedStatus: {
    backgroundColor: '#2196f3',
  },
  cancelledStatus: {
    backgroundColor: '#f44336',
  },
  defaultStatus: {
    backgroundColor: '#9e9e9e',
  },
  noOrdersText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});

// Estilos para el Modal de calificación
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filledStar: {
    fontSize: 30,
    color: '#ffc107',
    marginHorizontal: 5,
  },
  emptyStar: {
    fontSize: 30,
    color: '#ccc',
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
    flex: 1,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#e0e0e0',
  },
  buttonSave: {
    backgroundColor: '#e91e63',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Orders;
