/**
 * Legal entity and privacy policy configuration for Rápido Pack Valencia.
 * Contains editable placeholders for CIF/NIF and regulatory compliance data (LSSI-CE & RGPD).
 */

export const LEGAL = {
  tradeName: 'Rápido Pack Valencia',
  legalName: 'Juan Carlos Naranjo Espinosa',
  nif: '24349144X',
  address: 'Carrer del Comte Ronrée, 8, 46910 Alfafar, Valencia (España)',
  email: 'contacto@rapidopackvalencia.es',
  phone: '640 39 74 34',
  dpoEmail: 'contacto@rapidopackvalencia.es',
  registryData: '[Inscripción mercantil pendiente de asignación]',
  hostingProvider: 'Cloudflare, Inc. (101 Townsend St, San Francisco, CA 94107, USA)',
  analyticsProvider: 'Google Ireland Limited (Gordon House, Barrow Street, Dublín 4, Irlanda)',
  analyticsTool: 'Google Analytics 4 / Google Tag Manager',
  lastUpdated: 'Noviembre de 2026',
} as const;

export type LegalConfig = typeof LEGAL;
