// TinyRide by Dodail — Visual Identity & Design Tokens

export const colors = {
  // Brand Primary Navy
  navy: {
    50: '#F0F4F8',
    100: '#D9E2EC',
    200: '#BCCCDC',
    300: '#9FB3C8',
    400: '#829AB1',
    500: '#627D98',
    600: '#486581',
    700: '#334E68',
    800: '#1B2F4E', // Brand Primary Dark
    900: '#0F1E36', // Brand Deep Navy
    950: '#070D18',
  },

  // Brand Accent Orange
  orange: {
    50: '#FFF5EB',
    100: '#FEE7D3',
    200: '#FDCBA8',
    300: '#FBAF7D',
    400: '#FA9351',
    500: '#FF6B00', // Brand Core Accent
    600: '#E05D00',
    700: '#B84C00',
    800: '#8F3B00',
    900: '#662A00',
  },

  // Functional Semantic Palette
  success: {
    50: '#ECFDF5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  danger: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },

  // Neutrals
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const brandMeta = {
  name: 'TinyRide',
  by: 'Dodail',
  tagline: 'Little Rides. Big Peace of Mind.',
  company: 'Dodail Solutions Private Limited',
  pilotCity: 'Hyderabad, Telangana, India',
  supportPhone: '+91 40 4567 8900',
  supportEmail: 'support@dodail.com',
} as const;

/**
 * Formats an amount in Indian Rupees (e.g. ₹3,500)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats distance in kilometers with 1 decimal precision
 */
export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Formats 24h HH:mm time string to 12h AM/PM (e.g., "08:15" -> "8:15 AM")
 */
export function formatTime12h(timeStr: string): string {
  const [hoursStr, minsStr] = timeStr.split(':');
  if (!hoursStr || !minsStr) return timeStr;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minsStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutesFormatted} ${ampm}`;
}
