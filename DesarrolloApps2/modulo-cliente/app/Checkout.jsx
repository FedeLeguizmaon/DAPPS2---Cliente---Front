import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/actions/cartActions';
import { api } from '../utils/api';

const Checkout = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showCheck, setShowCheck] = useState(true);
  const [orderData, setOrderData] = useState(null);

  // Obtener datos del usuario y carrito desde Redux
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector(state => state.cart.items);
  const cartTotal = useSelector(state => state.cart.total);

  useEffect(() => {
    // Crear datos del pedido una vez al montar el componente
    createOrderData();

    const timer = setTimeout(() => {
      setShowCheck(false);
    }, 10000); // 10 segundos

    return () => clearTimeout(timer); // limpieza del temporizador
  }, []);

  const createOrderData = async () => {
    // Generar ID único para el pedido
    const orderId = 'SP' + Date.now().toString().slice(-6);

    // Obtener timestamp actual para la fecha
    const now = new Date();

    // Crear objeto con todos los datos del pedido
    const newOrderData = {
      id: orderId,
      fechaCreacion: now.toISOString(),
      estado: 'EN_CAMINO', // Estado inicial después del pago

      // Datos del cliente (desde Redux)
      cliente: {
        nombre: user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Usuario',
        telefono: user?.telefono || '+54 11 0000-0000',
        email: user?.email || 'usuario@email.com',
        direccion: 'Casa Rosada, Balcarce 50, C1064AAB CABA' // Por defecto, idealmente desde selección del usuario
      },

      // Datos del restaurante (por defecto Güerrin)
      restaurante: {
        id: 'rest_001',
        nombre: 'Pizzería Güerrin',
        direccion: 'Av. Corrientes 1368, C1043 CABA',
        telefono: '+54 11 4371-8141'
      },

      // Datos del repartidor (asignado automáticamente)
      repartidor: {
        id: 'rep_001',
        nombre: 'Carlos Martinez',
        telefono: '+54 11 5555-1234',
        vehiculo: 'Moto Honda XR150'
      },

      // Productos del carrito
      productos: cartItems.map(item => ({
        id: item.id,
        nombre: item.name,
        cantidad: item.quantity,
        precioUnitario: item.price,
        precio: item.price * item.quantity,
        // Incluir addons si los hay
        addons: item.addons ? Object.keys(item.addons).map(addonName => ({
          nombre: addonName,
          precio: item.addons[addonName]
        })) : []
      })),

      // Totales
      subtotal: cartTotal,
      deliveryFee: 0, // Sin costo de envío por ahora
      descuento: 0,
      total: cartTotal,

      // Datos de ubicación
      ubicacionRestaurante: {
        lat: -34.604019345084936,
        lng: -58.385949813495365
      },
      ubicacionDestino: {
        lat: -34.60802877002906,
        lng: -58.37037817016744
      },
      ubicacionRepartidor: {
        lat: -34.60513444417913,
        lng: -58.378509242618875
      },

      // Tiempo estimado (calculado basado en distancia)
      tiempoEstimado: 15,
      tiempoEstimadoEntrega: new Date(now.getTime() + 15 * 60000).toISOString(), // 15 minutos desde ahora

      // Método de pago usado
      metodoPago: 'PESOS', // o 'CRIPTO' según lo seleccionado en Cart

      // Información adicional
      instruccionesEspeciales: null,
      propina: 0
    };

    setOrderData(newOrderData);

    // Limpiar el carrito después de crear el pedido
    dispatch(clearCart());

    console.log('🛍️ Pedido creado:', newOrderData);

    // --- INTEGRACIÓN CON BACKEND - EVENTOS ---
    try {
      // Evento 1: Pedido Creado
      console.log('📡 Enviando evento: Pedido Creado');
      const eventoCrearResponse = await api.post('/api/pedido/events/creado', {
        pedidoId: Number(newOrderData.id.replace('SP', '')),
        comercio_id: Number(newOrderData.restaurante.id.replace('rest_', '')),
        cliente_nombre: newOrderData.cliente.nombre,
        direccion_entrega: newOrderData.cliente.direccion,
        productos: newOrderData.productos.map(p => ({
          producto_id: p.id,
          nombre: p.nombre,
          desc: p.nombre, // Usando el nombre como descripción por defecto
          precio: p.precio, // Precio final del producto
          cant: p.cantidad
        })),
      });

      if (eventoCrearResponse.success) {
        console.log('✅ Evento "creado" enviado exitosamente');
      } else {
        console.warn('⚠️ Error en evento "creado":', eventoCrearResponse.message);
      }

      // Evento 2: Pedido Pagar
      console.log('📡 Enviando evento: Pedido Pagar');
      
      // Convertir método de pago al formato que espera el backend
      let paymentType = newOrderData.metodoPago.toLowerCase();
      if (paymentType === 'pesos') {
        paymentType = 'fiat';
      }
      
      const eventoPagarResponse = await api.post('/api/pedido/events/pagar', {
        fromEmail: newOrderData.cliente.email,
        toEmail: 'localPepas@gmail.com', // Email del restaurante/tenant
        amount: newOrderData.total.toString(), // Convertir a string como espera el backend
        concept: `Pedido #${newOrderData.id} - ${newOrderData.restaurante.nombre}`,
        paymentType: paymentType // 'fiat' o 'crypto'
      });

      if (eventoPagarResponse.success) {
        console.log('✅ Evento "pagar" enviado exitosamente');
      } else {
        console.warn('⚠️ Error en evento "pagar":', eventoPagarResponse.message);
      }

    } catch (error) {
      console.error('❌ Error enviando eventos al backend:', error);
      // No bloqueamos la UI si fallan los eventos, solo loggeamos el error
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleTrackOrder = () => {
    if (orderData) {
      console.log('📍 Navegando a OrderTracker con datos:', orderData.id);
      navigation.navigate('OrderTracker', {
        orderId: orderData.id,
        orderDetails: orderData
      });
    } else {
      console.warn('⚠️ No hay datos del pedido disponibles');
      // Fallback: navegar sin datos (usará mock)
      navigation.navigate('OrderTracker');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.successText}>¡Compra exitosa!</Text>
        <Text style={styles.subText}>Tu pago fue procesado correctamente.</Text>

        {/* Mostrar información del pedido */}
        {orderData && (
          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderIdText}>Pedido #{orderData.id}</Text>
            <Text style={styles.orderTotalText}>Total: ${orderData.total}</Text>
            <Text style={styles.estimatedTimeText}>
              Tiempo estimado: {orderData.tiempoEstimado} minutos
            </Text>
          </View>
        )}

        {showCheck && (
          <Image
            source={require('../assets/images/check.png')} // Asegurate de tener esta imagen en assets
            style={styles.checkImage}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, !orderData && styles.disabledButton]}
          onPress={handleTrackOrder}
          disabled={!orderData}
        >
          <Text style={styles.buttonText}>
            {orderData ? 'Seguir mi pedido' : 'Preparando seguimiento...'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
          <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          📱 Recibirás notificaciones del estado de tu pedido
        </Text>
        <Text style={styles.infoText}>
          🚚 El repartidor se contactará contigo al llegar
        </Text>
      </View>
    </View>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A86B',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  orderInfoContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#00A86B',
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderTotalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  estimatedTimeText: {
    fontSize: 14,
    color: '#00A86B',
    fontWeight: '600',
  },
  checkImage: {
    width: 120,
    height: 120,
    marginTop: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  secondaryButton: {
    borderColor: '#00A86B',
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#00A86B',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});