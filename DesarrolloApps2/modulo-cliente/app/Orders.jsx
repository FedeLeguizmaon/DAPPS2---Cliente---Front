import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Componente para mostrar la información de un pedido individual
const OrderItem = ({ order }) => {
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

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderImageContainer}>
        {/* Reemplaza con la imagen real del pedido */}
        <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.orderImage} />
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>Pedido ID : {order.id}</Text>
        <Text style={styles.orderPrice}>$ {order.price.toFixed(2)}</Text>
        <View style={styles.rating}>
          {Array(Math.floor(order.rating)).fill().map((_, i) => (
            <Text key={i} style={styles.star}>⭐</Text>
          ))}
          {Array(5 - Math.floor(order.rating)).fill().map((_, i) => (
            <Text key={i + Math.floor(order.rating)} style={styles.emptyStar}>⭐</Text>
          ))}
        </View>
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
  // Aquí simularíamos los datos de los pedidos
  const [orders, setOrders] = useState([
    { id: 'SP 0023900', price: 25.20, rating: 4.3, status: 'Activo' },
    { id: 'SP 0023512', price: 40.00, rating: 5, status: 'Completado' },
    { id: 'SP 0023502', price: 85.00, rating: 3.8, status: 'Completado' },
    { id: 'SP 0023450', price: 20.50, rating: 4, status: 'Cancelado' },
    // ... más pedidos
  ]);
  /*
  const getOrders = async () => {
    try {
        const response = await fetch('https://api.example.com/orders');
        if (response.ok) {
            const data = await response.json();
            setOrders(data);
        } else {
            console.error('Error fetching orders:', response.status);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
  }
  */
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
      {/* getOrders(); */}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pedidos</Text>
        <View style={styles.filterButton}>
          {/* Icono de filtro */}
          <Text style={styles.filterIcon}>⚙️</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        {/* Icono de búsqueda */}
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
          <OrderItem key={order.id} order={order} />
        ))}
        {filteredOrders.length === 0 && (
          <Text style={styles.noOrdersText}>No se han encontrado pedidos con los filtros actuales.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  orderPrice: {
    fontSize: 14,
    color: '#e91e63',
    marginBottom: 5,
  },
  rating: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    color: '#ffc107',
  },
  emptyStar: {
    fontSize: 16,
    color: '#ccc',
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

export default Orders;