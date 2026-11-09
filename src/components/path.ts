//A API do routes retorna uma string que precisa ser decodificada
export const decodificarPolyline = (encoded: string) => {
  const pontos: { latitude: number; longitude: number }[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    pontos.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return pontos;
};

interface Coordenada {
  latitude: number;
  longitude: number;
}

export const calcularRotaApi = async (
  origem: Coordenada,
  destino: Coordenada,
  modo: 'WALK' | 'DRIVE',
): Promise<Coordenada[]> => {
  try {
    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: { latitude: origem.latitude, longitude: origem.longitude },
          },
        },
        destination: {
          location: {
            latLng: { latitude: destino.latitude, longitude: destino.longitude },
          },
        },
        travelMode: modo,
      }),
    });
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      return decodificarPolyline(data.routes[0].polyline.encodedPolyline);
    }
    console.log('Routes API retornou vazio: ', data);
    return [];
  } catch (e) {
    console.error('Erro ao requisitar rota: ', e);
    return [];
  }
};
