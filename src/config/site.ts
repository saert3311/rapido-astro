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

const fullStreet = 'Carrer del Comte Ronrée, 8';
const shortStreet = 'C/ Comte Ronrée, 8';
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
    cityTag: 'Valencia · Alfafar',
    tagline: 'Tienda Outlet, Segunda Mano y Punto de Paquetería',
    metaDescription:
      'Outlet físico y punto de paquetería en Alfafar (Valencia). Primeras marcas y productos de segunda mano con hasta -70% PVP revisados en tienda con banco de pruebas con enchufe. Stock renovado todas las semanas.',
    maxDiscountPct: 70,
    restockFrequency: 'Semanal',
  },

  contact: {
    phoneDisplay: rawPhone,
    phoneRaw: digitsPhone,
    phoneHref: `tel:${digitsPhone}`,
    whatsappHref: `https://wa.me/${countryCode}${digitsPhone}`,
    email: 'contacto@rapidopack.es',
    emailHref: 'mailto:contacto@rapidopack.es',
  },

  location: {
    street: fullStreet,
    shortStreet,
    postalCode,
    city,
    province,
    fullAddress,
    parkingNote: 'Aparcamiento en puerta',
    driveTimeMinutes: 8,
    driveTimeLabel: '8 min',
    transitNote: 'Desde Valencia por V-31',
    mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`,
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
    { name: 'Amazon Hub Counter', badge: 'Oficial', desc: 'Recogidas y devoluciones sin imprimir etiqueta' },
    { name: 'InPost', badge: 'Punto Pack', desc: 'Envíos y recogidas de comercio electrónico' },
    { name: 'GLS', badge: 'ParcelShop', desc: 'Paquetería nacional e internacional exprés' },
    { name: 'SEUR', badge: 'Pickup', desc: 'Red de puntos de conveniencia SEUR' },
    { name: 'CTT Express', badge: 'Punto CTT', desc: 'Servicio oficial de paquetería urgente' },
  ],
} as const;

export type SiteConfig = typeof SITE;
