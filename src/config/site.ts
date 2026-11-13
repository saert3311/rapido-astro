/**
 * Single source of truth for Rápido Pack Valencia store details,
 * contact channels, physical location, opening hours, and parcel carriers.
 */

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

const rawPhone = '640 39 74 34';
const digitsPhone = rawPhone.replace(/\D/g, '');
const countryCode = '34';

const fullStreet = 'Carrer del Comte Ronrée 8';
const shortStreet = 'C/ Comte Ronrée 8';
const postalCode = '46910';
const city = 'Alfafar';
const province = 'Valencia';
const fullAddress = `${fullStreet}, ${postalCode} ${city}, ${province}`;

const weekdayOpen = '09:30';
const weekdayClose = '20:00';
const saturdayOpen = '10:00';
const saturdayClose = '15:00';

export const SITE = {
  brand: {
    name: 'Rápido Pack Valencia',
    shortName: 'Rápido Pack',
    domain: 'https://rapidopackvalencia.es',
    canonicalBase: 'https://rapidopackvalencia.es',
    cityTag: 'Valencia · Tienda Física y Web',
    tagline: 'Tienda Física y Web · Outlet, Segunda Mano y Paquetería',
    metaDescription:
      'Punto oficial de paquetería y tienda física outlet de segunda mano con próxima tienda web en Valencia. Hasta -70% y banco de pruebas.',
    maxDiscountPct: 70,
    restockFrequency: 'Semanal',
  },

  contact: {
    phoneDisplay: rawPhone,
    phoneRaw: digitsPhone,
    phoneHref: `tel:${digitsPhone}`,
    whatsappHref: `https://wa.me/${countryCode}${digitsPhone}`,
    email: 'contacto@rapidopackvalencia.es',
    emailHref: 'mailto:contacto@rapidopackvalencia.es',
    notificationEmail:
      typeof process !== 'undefined' && process.env?.MAILJET_TO_EMAIL
        ? process.env.MAILJET_TO_EMAIL
        : 'contacto@rapidopackvalencia.es',
  },

  location: {
    street: fullStreet,
    shortStreet,
    postalCode,
    city,
    province,
    fullAddress,
    geo: {
      latitude: 39.4216,
      longitude: -0.3855,
    },
    stationName: 'Estación Alfafar-Benetússer',
    stationWalkMinutes: 1,
    stationWalkLabel: '1 min a pie',
    stationNote: 'A 1 min a pie de la Estación Alfafar-Benetússer (Cercanías / MetroBus)',
    stationLine: 'Cercanías C-1 / C-2 (directo 5 min desde Valencia Nord)',
    driveTimeMinutes: 8,
    driveTimeLabel: '8 min',
    transitNote: 'Desde Valencia Nord en 5 min de tren o por V-31',
    mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`,
    mapsEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&hl=es&z=17&output=embed`,
  },

  schedule: {
    weekdays: {
      open: weekdayOpen,
      close: weekdayClose,
      openMinutes: toMinutes(weekdayOpen),
      closeMinutes: toMinutes(weekdayClose),
      label: `${weekdayOpen} – ${weekdayClose}`,
    },
    saturday: {
      open: saturdayOpen,
      close: saturdayClose,
      openMinutes: toMinutes(saturdayOpen),
      closeMinutes: toMinutes(saturdayClose),
      label: `${saturdayOpen} – ${saturdayClose}`,
    },
    sunday: {
      closed: true,
      label: 'Cerrado',
    },
    summaryBadge: `L–V ${weekdayOpen}–${weekdayClose} · Sáb ${saturdayOpen}–${saturdayClose}`,
    fullScheduleLabel: `lunes a viernes de ${weekdayOpen} a ${weekdayClose} h y sábados de ${saturdayOpen} a ${saturdayClose} h`,
  },

  carriers: [
    { name: 'INPOST', badge: 'Punto Pack', desc: 'Envíos y recogidas de comercio electrónico' },
    { name: 'GLS', badge: 'ParcelShop', desc: 'Paquetería nacional e internacional exprés' },
    { name: 'SEUR', badge: 'Pickup', desc: 'Red de puntos de conveniencia SEUR' },
    { name: 'KANGURO', badge: 'Punto Kanguro', desc: 'Red de entregas y recogidas inteligentes' },
  ],

  analytics: {
    gtmId:
      typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_GTM_ID
        ? (import.meta.env.PUBLIC_GTM_ID as string)
        : 'GTM-PGBXBVXJ',
  },

  security: {
    turnstileSiteKey:
      typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_TURNSTILE_SITE_KEY
        ? (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string)
        : typeof process !== 'undefined' && (process.env?.PUBLIC_TURNSTILE_SITE_KEY || process.env?.TURNSTILE_SITE_KEY)
          ? ((process.env.PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY) as string)
          : '0x4AAAAAAFWf9LvYLm41PcPy',
  },
} as const;

export type SiteConfig = typeof SITE;
