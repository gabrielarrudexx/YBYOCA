/**
 * @file Centralized frontend configuration.
 * @module frontend/config
 */

/**
 * API Configuration
 * @property {string} API_URL - The base URL for API calls. Should not have a trailing slash.
 */
export const API_URL = ''; // Use relative URLs to work in any environment

/**
 * Builds a full API URL, ensuring no double slashes.
 * @param {string} path - The endpoint path.
 * @returns {string} The full URL.
 */
export const buildUrl = (path) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;


/**
 * UI Configuration
 * @property {Object.<string, string>} CATEGORY_CLASSES - CSS classes for expense categories.
 */
export const CATEGORY_CLASSES = {
    'Matéria Prima': 'bg-blue-100 text-blue-800',
    'Mão de Obra': 'bg-green-100 text-green-800',
    'Custos Variados': 'bg-yellow-100 text-yellow-800',
    'default': 'bg-gray-100 text-gray-800',
};

/**
 * Storage Configuration
 * @property {Object.<string, string>} STORAGE_KEYS - Keys for localStorage.
 */
export const STORAGE_KEYS = {
    USER_TOKEN: 'userToken',
};
