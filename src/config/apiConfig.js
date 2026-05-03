if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
    console.error('[CONFIG] REACT_APP_API_URL no está definida en producción. El sistema usará localhost como fallback, lo cual es incorrecto.');
}

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
export const API_BASE_URL = API_URL;
export const API_PREFIX = API_URL;
