export const DISTANCIA_ALERTA_METROS = 200;

export const ZOOM_TRANSITO = 15;

export const ZOOM_A_PE = 20;

export const MAPA_OFF_ESTILO = [
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'labels.text.fill',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
];
