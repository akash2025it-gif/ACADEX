/**
 * ACADEX Configuration & API Environment Settings
 * Supports seamless separate hosting (Vercel frontend + Django backend)
 */

function resolveApiBaseUrl() {
  // 0. Check URL query parameter override e.g. ?api=https://acadex-backend.onrender.com/api
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const apiParam = urlParams.get('api');
    if (apiParam) {
      const cleanParam = apiParam.trim().replace(/\/+$/, '');
      localStorage.setItem('acadex_api_url', cleanParam);
      return cleanParam;
    }
  } catch (e) {}

  // 1. Check runtime window override
  if (window.ACADEX_API_URL) {
    return window.ACADEX_API_URL.trim().replace(/\/+$/, '');
  }

  // 2. Check meta tag override
  const metaTag = document.querySelector('meta[name="acadex-api-url"]');
  if (metaTag && metaTag.content) {
    return metaTag.content.trim().replace(/\/+$/, '');
  }

  // 3. Check persistent localStorage setting
  const storedUrl = localStorage.getItem('acadex_api_url');
  if (storedUrl) {
    return storedUrl.trim().replace(/\/+$/, '');
  }

  // 4. Default for local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }

  // 5. Default for production relative path (or Vercel rewrite proxy)
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
