import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({config}: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Imobi',
    slug: 'imobi',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'imobi',
    icon: "./assets/images/icon.png",
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
        icon: "./assets/expo.icon"
    },
    android: {

        adaptiveIcon: {
            backgroundColor: '#E6F4F3',
            foregroundImage: "./assets/images/android-icon-foreground.png",
            backgroundImage: "./assets/images/android-icon-background.png",
            monochromeImage: "./assets/images/android-icon-monochrome.png"
        },
        package: 'com.infrala.imobi',
        allowBackup: false,
        config: {
            googleMaps: {
                apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
        },
        permissions: [
            'android.permission.ACCESS_COARSE_LOCATION',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.VIBRATE',
        ],
    },
    plugins: [
        'expo-router',
        'expo-sqlite',
        'expo-secure-store',
        'expo-audio',
        'expo-asset',
        [
            "expo-build-properties",
            {
                android: {
                    enableMinifyInReleaseBuilds: false,
                    extraProguardRules:`
                        -keep class androidx.work.** { *; }
                        -keep class androidx.room.** { *; }
                        -keep class * extends androidx.room.RoomDatabase { *; }
                        -keep @androidx.annotation.Keep class * { *; }
                    `
                }
            }
        ],
        [
            "expo-splash-screen",
            {
                backgroundColor: '#208AEF',
                image: "./assets/images/splash-icon.png",
                imageWidth: 76
            }
        ],
        [
            'expo-location',
            {
                locationAlwaysAndWhenInUsePermission:
                    'Permitir que o Imobi acesse sua localização enquanto o aplicativo estiver em uso.'
            },
        ],
        [
            'react-native-maps',
            {
                enableGoogleMaps: true,
                androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
            }
        ]
    ],
    extra: {
        eas:
        {
            "projectId": "6170a79d-0c10-4681-a241-a3e989e660f4"
        },
        router: {
            asyncRoutes: {
                web: true
            }
        }
    },
    web: {
        output: "server",
        favicon: "./assets/images/favicon.png"
    },
    experiments: {
        typedRoutes: true,
        reactCompiler: false
    }
})