import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function OrderTracker() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const navigation = useNavigation();
  const latitude = -34.6037;
  const longitude = -58.3816;

  // HTML que contiene el iframe de Google Maps
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html, iframe {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168878895464!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzEzLjMiUyA1OMKwMjInNTMuNyJX!5e0!3m2!1ses!2sar!4v1620000000000!5m2!1ses!2sar"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </body>
    </html>
  `;

  const handleSupport = () => {
    // Aquí puedes agregar la lógica para el soporte
    console.log('Soporte presionado');
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Seguir Pedido</Text>
      </View>

      {/* Mapa más pequeño */}
      <View style={styles.mapContainer}>
        {!isMapLoaded && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e91e63" />
          </View>
        )}

        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={[styles.map, !isMapLoaded && styles.hidden]}
          onLoadEnd={() => setIsMapLoaded(true)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
        />

        {isMapLoaded && (
          <View style={styles.motorcycleIcon}>
            <FontAwesome name="motorcycle" size={36} color="red" />
          </View>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleSupport}>
            <FontAwesome name="headphones" size={24} color="#fff" />
            <Text style={styles.buttonText}>Soporte</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleHome}>
            <FontAwesome name="home" size={24} color="#fff" />
            <Text style={styles.buttonText}>Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  titleContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  mapContainer: {
    height: '55%', // Ajustado para dar más espacio a los botones
    width: '100%',
    position: 'relative',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hidden: {
    opacity: 0,
  },
  motorcycleIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 5,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20, // Espacio entre botones
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 120, // Ancho mínimo para los botones
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
