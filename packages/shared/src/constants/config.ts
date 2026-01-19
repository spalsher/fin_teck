export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
export const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';

export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 5;

export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const CURRENCIES = {
  PKR: 'PKR',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
} as const;

export const DEFAULT_CURRENCY = CURRENCIES.PKR;

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';
export const DISPLAY_DATETIME_FORMAT = 'DD MMM YYYY, HH:mm';
