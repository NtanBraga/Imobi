import { Localizacao } from '@/models';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

//Hook para detectar a localizacao do usuario no mapa
export const useLocation = () => {
  const [location, setLocation] = useState<Localizacao | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    //Variavel para registrar GPS
    let subscription: Location.LocationSubscription | null = null;

    //GPS em primeiro plano
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de acesso à localização foi negada.');
        return;
      }

      //Registro do GPS
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            precisao: newLocation.coords.accuracy || 0,
          });
        },
      );
    };
    startTracking();

    // Para GPS para nao ficar em segundo plano
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);
  return { location, errorMsg };
};
