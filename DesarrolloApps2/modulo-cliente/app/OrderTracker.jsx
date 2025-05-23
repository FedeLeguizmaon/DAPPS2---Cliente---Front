import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';

export default function OrderTracker() {
  const latitude = -34.6037;
  const longitude = -58.3816;

  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <View style={styles.container}>
      {/* Mapa embebido con Google Maps */}
      <WebView
        originWhitelist={['*']}
        source={{ uri: mapUrl }}
        style={styles.map}
      />

      {/* Motito encima del mapa */}
      <View style={styles.motorcycleIcon}>
        <FontAwesome name="motorcycle" size={36} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  motorcycleIcon: {
    position: 'absolute',
    top: Dimensions.get('window').height / 2 - 36, // Centrado vertical (ajustable)
    left: Dimensions.get('window').width / 2 - 18, // Centrado horizontal (ajustable)
    zIndex: 10,
  },
});
