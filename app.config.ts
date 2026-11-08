import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({config}: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Imobi',
    slug: 'imobi',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'imobi',
    userInterfaceStyle: 'automatic',
    ios: {
        supportsTablet: false,
        bundleIdentifier: 'com.infratech.imobi',
        config: {
            googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
        infoPlist: {
            NSLocationWhenInUseUsageDescription:
                'O Imobi precisa de sua localização para exibir alertas de via, moedas e guiar sua rota em tempo real',
        },
    },
    android: {
        package: 'com.infrala.imobi',
        config: {
            googleMaps: {
                apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
        },
        permissions: [
            'ACCESS_COARSE_LOCATION',
            'ACCESS_FINE_LOCATION',
            'VIBRATE',
        ],
    },
    plugins: [
        'expo-router',
        'expo-sqlite',
        'expo-secure-store',
        'expo-audio',
        "expo-splash-screen",
        [
            'expo-location',
            {
                locationAlwaysAndWhenInUsePermission:
                    'Permitir que o Imobi acesse sua localização enquanto o aplicativo estiver em uso.'
            },
        ],
    ],
    extra: {
        "eas":
        {
            "projectId": "6170a79d-0c10-4681-a241-a3e989e660f4"
        }
    }
})