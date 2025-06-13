import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { api } from '@/utils/api'; // Asegúrate de que esta ruta sea correcta para tu `api` instance

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
      case 'en_camino':
        return styles.activeStatus;
      case 'completado':
      case 'entregado':
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
        {/* Usamos una imagen de placeholder ya que la API no la incluye aún */}
        <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.orderImage} />
      </View>
      <View style={styles.orderInfo}>
        {/* Formateamos el ID para que coincida con "SP 000000X" */}
        <Text style={styles.orderId}>Pedido ID : SP {String(order.id).padStart(7, '0')}</Text>

        {/* Lista de productos en el pedido */}
        <View style={styles.productsList}>
          <Text style={styles.productsListTitle}>Productos:</Text>
          {order.products && order.products.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productName}>{product.nombre} (x{product.cantidad})</Text>
              <View style={styles.productDetails}>
                {product.precioOriginal && product.precioOriginal > product.precioActual && (
                  <Text style={styles.productOriginalPrice}>$ {product.precioOriginal.toFixed(2)}</Text>
                )}
                <Text style={styles.productPrice}>$ {product.precioActual.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Precio total del pedido */}
        <View style={styles.totalPriceContainer}>
          {order.subprice && order.subprice > order.price && (
            <Text style={styles.originalPriceText}>Total: $ {order.subprice.toFixed(2)}</Text>
          )}
          <Text style={styles.orderPrice}>Total: $ {order.price.toFixed(2)}</Text>
        </View>

        {/* Aquí convertimos las estrellas en un botón */}
        <TouchableOpacity
          onPressIn={handlePressIn} // Cuando se presiona
          onPressOut={handlePressOut} // Cuando se suelta
          style={styles.ratingButton}
          disabled={order.status.toLowerCase() !== 'completado' && order.status.toLowerCase() !== 'entregado'} // Solo se puede calificar si está completado o entregado
          activeOpacity={1} // Desactiva la opacidad por defecto de TouchableOpacity
        >
          <View style={styles.rating}>
            {[1, 2, 3, 4, 5].map((starValue) => (
              <Icon
                key={starValue}
                name={starValue <= order.rating ? 'star' : 'star-o'}
                size={16}
                color={isRatingPressed && starValue <= order.rating ? '#ff9800' : // Amarillo más oscuro al presionar
                               isRatingPressed && starValue > order.rating ? '#b0b0b0' : // Gris más oscuro al presionar
                               starValue <= order.rating ? '#ffc107' : '#ccc'} // Colores normales
                style={{ marginHorizontal: 1 }}
              />
            ))}
            {(order.status.toLowerCase() === 'completado' || order.status.toLowerCase() === 'entregado') && (
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

  // El estado inicial de orders es un array vacío, los datos se cargarán desde la API
  const [orders, setOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [initialRatingForModal, setInitialRatingForModal] = useState(0);

  // Función para obtener los pedidos desde la API
  const fetchOrders = async () => {
    try {
      // 1. Obtener la lista principal de pedidos
      const ordersResponse = await api.get('/api/pedidos/mis-pedidos');
      if (!ordersResponse.ok) {
        throw new Error(`HTTP error! status: ${ordersResponse.status}`);
      }
      const ordersData = await ordersResponse.json();

      // 2. Para cada pedido, obtener sus productos y calcular precios
      const ordersWithProductsPromises = ordersData.map(async (orderItem) => {
        let totalPrice = 0;
        let totalSubprice = 0;
        let productsDetails = []; // Para almacenar los detalles de los productos

        try {
          const productsResponse = await api.get(`/api/pedidos/${orderItem.id}/productos`);
          if (!productsResponse.ok) {
            console.warn(`Could not fetch products for order ${orderItem.id}. Status: ${productsResponse.status}`);
            // Si falla la carga de productos, se asume 0 para los precios y sin productos
            return {
              id: orderItem.id,
              price: 0,
              subprice: 0,
              products: [],
              rating: orderItem.calificacion || 0,
              status: orderItem.estado,
            };
          }
          const productsData = await productsResponse.json();
          productsDetails = productsData; // Almacena los productos obtenidos

          // Calcular el precio total y subprecio a partir de los productos
          productsData.forEach(product => {
            const currentProductPrice = product.precioActual || 0;
            const originalProductPrice = product.precioOriginal || currentProductPrice;
            const quantity = product.cantidad || 1;

            totalPrice += currentProductPrice * quantity;
            totalSubprice += originalProductPrice * quantity;
          });

        } catch (productError) {
          console.error(`Error fetching products for order ${orderItem.id}:`, productError);
          // Si hay un error en la carga de productos, los precios se mantienen en 0.
        }

        return {
          id: orderItem.id,
          price: parseFloat(totalPrice.toFixed(2)),
          subprice: parseFloat(totalSubprice.toFixed(2)),
          products: productsDetails, // Adjunta los detalles de los productos
          rating: orderItem.calificacion || 0,
          status: orderItem.estado,
        };
      });

      const mappedOrders = await Promise.all(ordersWithProductsPromises);
      setOrders(mappedOrders);

    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "No se pudieron cargar los pedidos. Inténtalo más tarde.");
    }
  };

  // Llama a fetchOrders una vez que el componente se monta
  useEffect(() => {
    fetchOrders();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

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
    // Asegurarse de que order.id sea un string para toLowerCase()
    const searchMatch = String(order.id).toLowerCase().includes(searchText.toLowerCase());
    // Mapea los estados de la API a tus filtros
    const filterMatch = activeFilter === 'Todos' ||
                        (activeFilter === 'Activo' && (order.status.toLowerCase() === 'activo' || order.status.toLowerCase() === 'en_camino')) ||
                        (activeFilter === 'Completado' && (order.status.toLowerCase() === 'completado' || order.status.toLowerCase() === 'entregado')) ||
                        (activeFilter === 'Cancelado' && order.status.toLowerCase() === 'cancelado');
    return searchMatch && filterMatch;
  });

  const handleFilterPress = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <View style={styles.container}>
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
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onRatePress={handleRateOrderPress} // Pasa la función para manejar la pulsación
            />
          ))
        ) : (
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
    alignItems: 'flex-start', // Cambiado a flex-start para alinear la imagen arriba
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
  // Estilos para la lista de productos
  productsList: {
    marginTop: 10,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  productsListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    flex: 2,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end', // Alinea los precios a la derecha
  },
  productPrice: {
    fontSize: 14,
    color: '#e91e63',
    marginLeft: 5,
  },
  productOriginalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  // Contenedor para el precio total del pedido
  totalPriceContainer: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
    alignItems: 'flex-end', // Alinea los totales a la derecha
  },
  // Estilo para el precio con descuento (total del pedido)
  orderPrice: {
    fontSize: 18, // Un poco más grande para el total
    fontWeight: 'bold',
    color: '#e91e63',
    marginTop: 2,
  },
  // Nuevo estilo para el subprecio (original del total del pedido)
  originalPriceText: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  ratingButton: {
    paddingVertical: 5,
    paddingRight: 10,
    alignSelf: 'flex-start', // Alinea el botón de calificación a la izquierda
    marginTop: 10, // Margen superior para separarlo de los precios
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 16,
    color: '#ffc107',
  },
  emptyStar: {
    fontSize: 16,
    color: '#ccc',
  },
  rateNowText: {
    fontSize: 14,
    color: '#e91e63',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  orderStatusContainer: {
    marginLeft: 10,
    alignSelf: 'flex-start', // Alinea el estado al inicio del contenedor del pedido
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
