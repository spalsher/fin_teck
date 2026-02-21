"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = exports.truncate = exports.formatDateTime = exports.formatDate = exports.formatNumber = exports.formatCurrency = void 0;
const formatCurrency = (amount, currency = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};
exports.formatNumber = formatNumber;
const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
exports.formatDateTime = formatDateTime;
const truncate = (str, length) => {
    if (str.length <= length)
        return str;
    return str.substring(0, length) + '...';
};
exports.truncate = truncate;
const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
//# sourceMappingURL=format.js.map