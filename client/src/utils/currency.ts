import { SUPPORTED_CURRENCIES } from '../types/index.ts';
import type { Currency } from '../types/index.ts';

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code);
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount.toFixed(2)}`;
  
  // Handle special cases for currency formatting
  switch (currencyCode) {
    case 'JPY':
    case 'KRW':
      // No decimal places for these currencies
      return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
    case 'USD':
    case 'EUR':
    case 'GBP':
    case 'CAD':
    case 'AUD':
    case 'SGD':
    case 'HKD':
      return `${currency.symbol}${amount.toFixed(2)}`;
    default:
      return `${amount.toFixed(2)} ${currency.symbol}`;
  }
};

export const getDefaultCurrency = (): string => {
  // Try to detect user's locale and return appropriate default currency
  const locale = navigator.language || 'en-US';
  
  if (locale.includes('US')) return 'USD';
  if (locale.includes('GB')) return 'GBP';
  if (locale.includes('JP')) return 'JPY';
  if (locale.includes('CA')) return 'CAD';
  if (locale.includes('AU')) return 'AUD';
  if (locale.includes('IN')) return 'INR';
  if (locale.includes('KR')) return 'KRW';
  if (locale.includes('CN')) return 'CNY';
  if (locale.includes('SE')) return 'SEK';
  if (locale.includes('NO')) return 'NOK';
  if (locale.includes('DK')) return 'DKK';
  if (locale.includes('SG')) return 'SGD';
  if (locale.includes('HK')) return 'HKD';
  
  // European countries that use EUR
  const euroCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'EE', 'LV', 'LT', 'LU', 'MT', 'SK', 'SI', 'CY'];
  if (euroCountries.some(country => locale.includes(country))) return 'EUR';
  
  return 'USD'; // Default fallback
};