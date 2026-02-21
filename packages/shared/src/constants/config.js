"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISPLAY_DATETIME_FORMAT = exports.DISPLAY_DATE_FORMAT = exports.DATETIME_FORMAT = exports.DATE_FORMAT = exports.DEFAULT_CURRENCY = exports.CURRENCIES = exports.ALLOWED_DOCUMENT_TYPES = exports.ALLOWED_IMAGE_TYPES = exports.MAX_FILE_SIZE_MB = exports.AUTH_RATE_LIMIT_MAX_REQUESTS = exports.RATE_LIMIT_MAX_REQUESTS = exports.RATE_LIMIT_WINDOW_MS = exports.JWT_REFRESH_TOKEN_EXPIRES_IN = exports.JWT_ACCESS_TOKEN_EXPIRES_IN = exports.PASSWORD_MAX_LENGTH = exports.PASSWORD_MIN_LENGTH = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = void 0;
exports.DEFAULT_PAGE_SIZE = 10;
exports.MAX_PAGE_SIZE = 100;
exports.PASSWORD_MIN_LENGTH = 8;
exports.PASSWORD_MAX_LENGTH = 128;
exports.JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
exports.JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';
exports.RATE_LIMIT_WINDOW_MS = 60 * 1000;
exports.RATE_LIMIT_MAX_REQUESTS = 100;
exports.AUTH_RATE_LIMIT_MAX_REQUESTS = 5;
exports.MAX_FILE_SIZE_MB = 10;
exports.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
exports.ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
exports.CURRENCIES = {
    PKR: 'PKR',
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
};
exports.DEFAULT_CURRENCY = exports.CURRENCIES.PKR;
exports.DATE_FORMAT = 'YYYY-MM-DD';
exports.DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
exports.DISPLAY_DATE_FORMAT = 'DD MMM YYYY';
exports.DISPLAY_DATETIME_FORMAT = 'DD MMM YYYY, HH:mm';
//# sourceMappingURL=config.js.map