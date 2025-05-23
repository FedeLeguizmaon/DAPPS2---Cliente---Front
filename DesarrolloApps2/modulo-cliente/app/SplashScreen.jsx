import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const CustomSplashScreen = ({ onFinish }) => {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);
    const slideAnim = new Animated.Value(30);
    const [countdown, setCountdown] = useState(5);
    const [splashReady, setSplashReady] = useState(false);

    useEffect(() => {
        console.log('🎬 Splash Screen Custom iniciado');

        // Configuración inicial del splash
        const initializeSplash = async () => {
            try {
                // Asegurarse de que el splash nativo no se oculte automáticamente
                await SplashScreen.preventAutoHideAsync();
                console.log('✅ Splash nativo pausado correctamente');
                setSplashReady(true);
            } catch (error) {
                console.log('⚠️ Error configurando splash nativo:', error);
                setSplashReady(true); // Continuar de todas formas
            }
        };

        initializeSplash();
    }, []);

    useEffect(() => {
        if (!splashReady) return;

        console.log('🎨 Iniciando animaciones del splash custom');

        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 8,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            console.log('✅ Animaciones completadas');
        });

        // Countdown timer
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                const newCount = prev - 1;
                console.log('⏰ Countdown:', newCount);
                if (newCount <= 0) {
                    clearInterval(countdownInterval);
                }
                return newCount <= 0 ? 0 : newCount;
            });
        }, 1000);

        // Ocultar después de 5 segundos
        const timer = setTimeout(async () => {
            await finishSplash();
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearInterval(countdownInterval);
        };
    }, [splashReady]);

    const finishSplash = async () => {
        console.log('🏁 Finalizando splash screen...');
        try {
            // Ocultar el splash nativo de Expo
            await SplashScreen.hideAsync();
            console.log('✅ Splash nativo ocultado');
        } catch (error) {
            console.log('❌ Error ocultando splash nativo:', error);
        }

        // Llamar a la función onFinish para mostrar la app
        onFinish();
    };

    // Si el splash no está listo, mostrar pantalla simple
    if (!splashReady) {
        return (
            <View style={styles.container}>
                <Text style={styles.appName}>🚚 Deliver.ar</Text>
                <Text style={styles.loadingText}>Iniciando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Círculos decorativos de fondo */}
            <Animated.View
                style={[
                    styles.backgroundCircle1,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                ]}
            />
            <Animated.View
                style={[
                    styles.backgroundCircle2,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                ]}
            />

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Logo principal de comida */}
                <View style={styles.logoWrapper}>
                    <Image
                        source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' // Hamburguesa bonita
                        }}
                        style={styles.logo}
                        resizeMode="contain"
                        onError={(error) => console.log('❌ Error cargando imagen:', error)}
                        onLoad={() => console.log('✅ Imagen cargada correctamente')}
                        onLoadStart={() => console.log('🔄 Iniciando carga de imagen...')}
                    />
                </View>

                {/* Nombre de la app con animación de deslizamiento */}
                <Animated.View
                    style={[
                        styles.textContainer,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={styles.appName}>🚚 Deliver.ar</Text>
                    <Text style={styles.tagline}>Tu comida favorita a domicilio</Text>
                    <Text style={styles.subtitle}>Rápido • Fresco • Confiable</Text>
                </Animated.View>

                {/* Indicador de carga con puntos animados */}
                <Animated.View
                    style={[
                        styles.loadingContainer,
                        { opacity: fadeAnim }
                    ]}
                >
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: countdown <= 5 ? `${(5 - countdown) * 20}%` : '0%'
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.loadingText}>Preparando tu experiencia gastronómica...</Text>
                    <Text style={styles.countdownText}>
                        {countdown > 0 ? `Iniciando en ${countdown} segundos` : '¡Listo para disfrutar! 🍽️'}
                    </Text>
                </Animated.View>
            </Animated.View>

            {/* Footer con versión */}
            <Animated.View
                style={[
                    styles.footer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <Text style={styles.footerText}>Hecho con React Native + Expo</Text>
                <Text style={styles.version}>v1.0.0 Beta</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF6347', // Color principal de tu app (tomato)
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundCircle1: {
        position: 'absolute',
        top: '15%',
        right: '10%',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    backgroundCircle2: {
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
        padding: 25,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 12,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logo: {
        width: 100,
        height: 100,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    appName: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 8,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 10,
        fontWeight: '600',
        opacity: 0.95,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.85,
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        width: 280,
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        opacity: 0.9,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '500',
    },
    countdownText: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.8,
        textAlign: 'center',
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
    },
    footerText: {
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 5,
    },
    version: {
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.8,
        fontWeight: '600',
    },
});

export default CustomSplashScreen;