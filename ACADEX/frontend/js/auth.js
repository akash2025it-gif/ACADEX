/**
 * ACADEX Authentication & State Manager
 */

const Auth = {
  currentUser: null,
  currentRole: null,

  init() {
    try {
      const storedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
      const storedRole = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ROLE);
      if (storedUser && API.getToken()) {
        this.currentUser = JSON.parse(storedUser);
        this.currentRole = storedRole;
      }
    } catch (e) {
      this.clearSession();
    }
  },

  isAuthenticated() {
    return !!(API.getToken() && this.currentUser);
  },

  isStudent() {
    return this.isAuthenticated() && this.currentRole === 'STUDENT';
  },

  isHOD() {
    return this.isAuthenticated() && this.currentRole === 'HOD';
  },

  setSession(user, token) {
    this.currentUser = user;
    this.currentRole = user.role;
    API.setToken(token);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ROLE, user.role);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user, role: user.role } }));
  },

  clearSession() {
    this.currentUser = null;
    this.currentRole = null;
    API.setToken(null);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ROLE);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user: null, role: null } }));
  },

  async login(username, password, role) {
    const res = await API.auth.login({ username, password, role });
    this.setSession(res.user, res.token);
    return res;
  },

  async registerStudent(data) {
    const res = await API.auth.registerStudent(data);
    if (res.token && res.user) {
      this.setSession(res.user, res.token);
    }
    return res;
  },

  async logout() {
    try {
      await API.auth.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      this.clearSession();
      window.location.hash = '#login';
    }
  }
};

Auth.init();
