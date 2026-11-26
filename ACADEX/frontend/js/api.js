/**
 * ACADEX Unified REST API Client
 * Secure communication layer with Django REST Framework backend
 */

const API = {
  // Get stored authentication token
  getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  // Set auth token
  setToken(token) {
    if (token) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  // Base request handler
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      ...(token ? { 'Authorization': `Token ${token}` } : {}),
      ...options.headers
    };

    // If body is not FormData, set Content-Type to application/json
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear auth and trigger session expiration if currently logged in
        if (this.getToken()) {
          this.setToken(null);
          localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
          localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ROLE);
          window.location.hash = '#login';
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      }

      // If response is 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = data.detail || data.error || (data.non_field_errors && data.non_field_errors[0]);

        if (!errorMsg && typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
          const messages = [];
          for (const [field, errors] of Object.entries(data)) {
            const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const errList = Array.isArray(errors) ? errors : [errors];
            const cleanErrors = errList.map(e => (typeof e === 'object' && e !== null) ? JSON.stringify(e) : String(e));
            messages.push(`${fieldLabel}: ${cleanErrors.join(' ')}`);
          }
          if (messages.length > 0) {
            errorMsg = messages.join('\n');
          }
        }

        if (!errorMsg) {
          errorMsg = response.statusText || 'An error occurred with the request';
        }

        const error = new Error(errorMsg);
        error.data = data;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.warn(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  },

  // GET helper
  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  // POST helper
  post(endpoint, data = {}, isFormData = false) {
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : data
    });
  },

  // PUT helper
  put(endpoint, data = {}, isFormData = false) {
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? data : data
    });
  },

  // PATCH helper
  patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    });
  },

  // DELETE helper
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================
  auth: {
    login(credentials) {
      return API.post('/auth/login/', credentials);
    },
    registerStudent(data) {
      return API.post('/auth/register-student/', data);
    },
    logout() {
      return API.post('/auth/logout/').finally(() => {
        API.setToken(null);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ROLE);
      });
    },
    getProfile() {
      return API.get('/auth/profile/');
    },
    updateProfile(data) {
      return API.patch('/auth/profile/', data);
    },
    changePassword(passwords) {
      return API.post('/auth/change-password/', passwords);
    }
  },

  // ==========================================
  // ANNOUNCEMENTS ENDPOINTS
  // ==========================================
  announcements: {
    list(params) {
      return API.get('/announcements/', params);
    },
    create(data) {
      return API.post('/announcements/', data);
    },
    delete(id) {
      return API.delete(`/announcements/${id}/`);
    }
  },

  // ==========================================
  // ATTENDANCE ENDPOINTS
  // ==========================================
  attendance: {
    getStudentSummary() {
      return API.get('/attendance/summary/');
    },
    getStudentHistory(params) {
      return API.get('/attendance/history/', params);
    },
    markAttendance(data) {
      return API.post('/attendance/mark/', data);
    },
    getDepartmentAnalytics(params) {
      return API.get('/attendance/department-analytics/', params);
    }
  },

  // ==========================================
  // TIMETABLE ENDPOINTS
  // ==========================================
  timetable: {
    get(params) {
      return API.get('/timetable/', params);
    },
    save(data) {
      return API.post('/timetable/', data);
    }
  },

  // ==========================================
  // ASSIGNMENTS & SUBMISSIONS ENDPOINTS
  // ==========================================
  assignments: {
    list(params) {
      return API.get('/assignments/', params);
    },
    create(formData) {
      return API.post('/assignments/', formData, true);
    },
    delete(id) {
      return API.delete(`/assignments/${id}/`);
    },
    submit(assignmentId, formData) {
      return API.post(`/assignments/${assignmentId}/submit/`, formData, true);
    },
    getSubmissions(assignmentId) {
      return API.get(`/assignments/${assignmentId}/submissions/`);
    },
    gradeSubmission(submissionId, data) {
      return API.post(`/assignments/submissions/${submissionId}/grade/`, data);
    }
  },

  // ==========================================
  // STUDY MATERIALS ENDPOINTS
  // ==========================================
  materials: {
    list(params) {
      return API.get('/study-materials/', params);
    },
    upload(formData) {
      return API.post('/study-materials/', formData, true);
    },
    delete(id) {
      return API.delete(`/study-materials/${id}/`);
    }
  },

  // ==========================================
  // DOCUMENTS ENDPOINTS
  // ==========================================
  documents: {
    list(params) {
      return API.get('/documents/', params);
    },
    upload(formData) {
      return API.post('/documents/', formData, true);
    },
    review(docId, data) {
      return API.post(`/documents/${docId}/review/`, data);
    }
  },

  // ==========================================
  // LEAVE REQUESTS ENDPOINTS
  // ==========================================
  leaves: {
    list(params) {
      return API.get('/leaves/', params);
    },
    apply(data) {
      return API.post('/leaves/', data);
    },
    review(leaveId, data) {
      return API.post(`/leaves/${leaveId}/review/`, data);
    }
  },

  // ==========================================
  // INTERNAL MARKS ENDPOINTS
  // ==========================================
  marks: {
    getStudentMarks(params) {
      return API.get('/marks/my-marks/', params);
    },
    getDepartmentMarks(params) {
      return API.get('/marks/', params);
    },
    saveMarks(data) {
      return API.post('/marks/', data);
    }
  },

  // ==========================================
  // NOTIFICATIONS ENDPOINTS
  // ==========================================
  notifications: {
    list() {
      return API.get('/notifications/');
    },
    markRead(id) {
      return API.post(`/notifications/${id}/read/`);
    },
    markAllRead() {
      return API.post('/notifications/mark-all-read/');
    }
  },

  // ==========================================
  // HOD / DEPARTMENT MANAGEMENT ENDPOINTS
  // ==========================================
  department: {
    getOverview() {
      return API.get('/department/overview/');
    },
    getStudents(params) {
      return API.get('/department/students/', params);
    },
    getStudentDetail(studentId) {
      return API.get(`/department/students/${studentId}/`);
    }
  }
};
