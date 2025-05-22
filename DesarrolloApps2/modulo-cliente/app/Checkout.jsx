 import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Checkout = () => {
  const navigation = useNavigation();
  const [showCheck, setShowCheck] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCheck(false);
    }, 10000); // 10 segundos

    return () => clearTimeout(timer); // limpieza del temporizador
  }, []);

  const handleGoHome = () => {
    navigation.navigate('Inicio');
  };

  const handleTrackOrder = () => {
    navigation.navigate('OrderTracker');
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.successText}>¡Compra exitosa!</Text>
        <Text style={styles.subText}>Tu pago fue procesado correctamente.</Text>

        {showCheck && (
          <Image
            source={require('../assets/images/check.png')} // Asegurate de tener esta imagen en assets
            style={styles.checkImage}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleTrackOrder}>
          <Text style={styles.buttonText}>Seguir mi pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
          <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
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
});