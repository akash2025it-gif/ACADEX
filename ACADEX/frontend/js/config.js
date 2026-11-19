/**
 * ACADEX Configuration & API Environment Settings
 * Supports seamless separate hosting (Vercel frontend + Django backend)
 */

function resolveApiBaseUrl() {
  // 1. Localhost and 127.0.0.1 strictly use local backend (offline-safe development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }

  // 2. Explicit query parameter override (e.g. ?api=https://...)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const apiParam = urlParams.get('api');
    if (apiParam) {
      return apiParam.trim().replace(/\/+$/, '');
    }
  } catch (e) {}

  // 3. Runtime window override
  if (window.ACADEX_API_URL) {
    return window.ACADEX_API_URL.trim().replace(/\/+$/, '');
  }

  // 4. Production Vercel deployment uses relative API base (handled by Vercel rewrite proxy)
  return '/api';
}

const CONFIG = {
  APP_NAME: 'ACADEX',
  APP_TAGLINE: 'Professional Student–HOD Academic Management Portal',
  VERSION: '2.0.0',
  
  API_BASE_URL: resolveApiBaseUrl(),
  
  STORAGE_KEYS: {
    AUTH_TOKEN: 'acadex_auth_token',
    USER_DATA: 'acadex_user_data',
    USER_ROLE: 'acadex_user_role'
  },
  
  ATTENDANCE_MIN_THRESHOLD: 75.0 // University examination eligibility threshold
};
