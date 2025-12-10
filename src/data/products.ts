export const APP_CONFIG = {
  currency: 'COP',
  locale: 'es-CO',
  maxWeightPerItem: 5,
  minWeightPerItem: 0.5,
  boneInFactor: 0.45,
  whatsappNumber: '573001234567', // Número de teléfono de destino para pedidos
};

export const COOKING_TEMPS = {
  azul: {
    label: 'Azul (Blue)',
    temp: '46-49°C',
    desc: 'Sellado fuerte, centro frío y rojo.',
  },
  medio: {
    label: 'Término Medio',
    temp: '54-57°C',
    desc: 'Centro rojo cálido, jugosidad máxima.',
  },
  'tres-cuartos': {
    label: 'Tres Cuartos',
    temp: '60-63°C',
    desc: 'Centro rosado, menos jugos.',
  },
};

export const formatPrice = (value: number) =>
  new Intl.NumberFormat(APP_CONFIG.locale, {
    style: 'currency',
    currency: APP_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(value);
