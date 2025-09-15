// Environment-based configuration
const isDevelopment = import.meta.env.MODE === 'development';

// Default values for development
const DEV_API_ROOT = 'http://localhost:1337';
const DEV_API_BASE = `${DEV_API_ROOT}/api/analyzer`;
const DEV_AUTH_BASE = `${DEV_API_ROOT}/api`;

// Default values for production
const PROD_API_ROOT = 'https://prompt-pal-api.onrender.com';
const PROD_API_BASE = `${PROD_API_ROOT}/api/analyzer`;
const PROD_AUTH_BASE = `${PROD_API_ROOT}/api`;

// Use environment variables if available, otherwise fall back to defaults
export const API_ROOT = isDevelopment 
    ? import.meta.env.VITE_API_ROOT || DEV_API_ROOT
    : import.meta.env.VITE_API_ROOT || PROD_API_ROOT;

export const API_BASE = isDevelopment
    ? import.meta.env.VITE_API_BASE || DEV_API_BASE
    : import.meta.env.VITE_API_BASE || PROD_API_BASE;

export const AUTH_BASE = isDevelopment
    ? import.meta.env.VITE_AUTH_BASE || DEV_AUTH_BASE
    : import.meta.env.VITE_AUTH_BASE || PROD_AUTH_BASE; 