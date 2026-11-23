/**
 * ACADEX Master Application Controller & Router
 */

const App = {
  currentView: null,

  init() {
    this.setupEventListeners();
    this.route();
  },

  setupEventListeners() {
    window.addEventListener('hashchange', () => this.route());
    window.addEventListener('auth:change', () => this.route());

    // Close modal on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    // Close modal on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        this.closeModal();
      }
    });
  },

  route() {
    let hash = window.location.hash.slice(1) || 'login';

    // If unauthenticated, allow only login and register
    if (!Auth.isAuthenticated()) {
      if (hash !== 'login' && hash !== 'register') {
        window.location.hash = '#login';
        return;
      }
      this.renderAuthView(hash);
      return;
    }

    // Role-based protection
    if (Auth.isStudent()) {
      if (hash.startsWith('hod-') || hash === 'login' || hash === 'register') {
        window.location.hash = '#student-overview';
        return;
      }
      if (!hash.startsWith('student-')) {
        hash = 'student-overview';
      }
    } else if (Auth.isHOD()) {
      if (hash.startsWith('student-') || hash === 'login' || hash === 'register') {
        window.location.hash = '#hod-overview';
        return;
      }
      if (!hash.startsWith('hod-')) {
        hash = 'hod-overview';
      }
    }

    this.currentView = hash;
    this.renderAppShell(hash);
  },

  renderAuthView(viewName) {
    const root = document.getElementById('appRoot');
    root.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <div class="brand-icon-box">${getIcon('graduationCap')}</div>
              <span>ACADEX</span>
              <span class="brand-tag">PORTAL</span>
            </div>
            <h2>Academic Management Portal</h2>
            <p>${viewName === 'register' ? 'Create student portal account' : 'Sign in to access your authorized dashboard'}</p>
          </div>

          <div class="auth-role-tabs">
            <button type="button" class="auth-role-tab active" id="tabStudent" onclick="App.switchAuthRole('STUDENT')">
              ${getIcon('user')} Student Portal
            </button>
            <button type="button" class="auth-role-tab" id="tabHOD" onclick="App.switchAuthRole('HOD')">
              ${getIcon('award')} HOD Portal
            </button>
          </div>

          <div class="auth-body">
            ${viewName === 'register' ? this.getRegisterFormHtml() : this.getLoginFormHtml()}
          </div>

          <div class="auth-footer">
            ${viewName === 'register' ? `
              Already registered? <a href="#login" style="font-weight: 600;">Sign In here</a>
            ` : `
              New Student? <a href="#register" style="font-weight: 600;">Register Portal Account</a>
            `}
          </div>
        </div>
      </div>
    `;
  },

  selectedAuthRole: 'STUDENT',

  switchAuthRole(role) {
    this.selectedAuthRole = role;
    const tabStudent = document.getElementById('tabStudent');
    const tabHOD = document.getElementById('tabHOD');
    const idLabel = document.getElementById('authIdLabel');
    const idInput = document.getElementById('authIdInput');

    if (role === 'STUDENT') {
      tabStudent?.classList.add('active');
      tabHOD?.classList.remove('active');
      if (idLabel) idLabel.textContent = 'Register Number or Username';
      if (idInput) idInput.placeholder = 'e.g. 25IT104 or alex';
    } else {
      tabStudent?.classList.remove('active');
      tabHOD?.classList.add('active');
      if (idLabel) idLabel.textContent = 'Employee ID or Username';
      if (idInput) idInput.placeholder = 'e.g. HOD-IT-01 or hod_it';
    }
  },

  getLoginFormHtml() {
    return `
      <form id="loginForm" onsubmit="App.handleLoginSubmit(event)">
        <div class="form-group">
          <label class="form-label" id="authIdLabel">Register Number or Username <span class="required">*</span></label>
          <input type="text" class="form-control" id="authIdInput" name="username" placeholder="e.g. 25IT104 or alex" required />
        </div>
        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.375rem;">
            <label class="form-label" style="margin: 0;">Password <span class="required">*</span></label>
            <a href="javascript:void(0)" onclick="App.showToast('Contact HOD office or administrator for password reset.', 'info')" style="font-size: 0.75rem;">Forgot?</a>
          </div>
          <input type="password" class="form-control" name="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.75rem;">
          Sign In to Portal
        </button>
      </form>
    `;
  },

  getRegisterFormHtml() {
    return `
      <form id="registerForm" onsubmit="App.handleRegisterSubmit(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">First Name <span class="required">*</span></label>
            <input type="text" class="form-control" name="first_name" placeholder="Alex" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name <span class="required">*</span></label>
            <input type="text" class="form-control" name="last_name" placeholder="Johnson" required />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Register Number <span class="required">*</span></label>
            <input type="text" class="form-control" name="register_number" placeholder="25IT104" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email Address <span class="required">*</span></label>
            <input type="email" class="form-control" name="email" placeholder="alex@acadex.edu" required />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Department</label>
            <select class="form-control" name="department">
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics & Comm">Electronics & Comm</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Academic Year</label>
            <select class="form-control" name="year">
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3" selected>Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password <span class="required">*</span></label>
          <input type="password" class="form-control" name="password" placeholder="At least 8 characters" minlength="8" required />
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem;">
          Complete Registration
        </button>
      </form>
    `;
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    const role = this.selectedAuthRole;

    try {
      // Try live API login first
      const res = await API.auth.login({ username, password, role });
      Auth.setSession(res.user, res.token);
      this.showToast('Signed in successfully!', 'success');
      window.location.hash = role === 'HOD' ? '#hod-overview' : '#student-overview';
    } catch (err) {
      this.showToast(err.message || 'Unable to sign in. Please verify your credentials.', 'error');
    }
  },

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      username: form.register_number.value.trim(),
      register_number: form.register_number.value.trim(),
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      email: form.email.value.trim(),
      department: form.department.value,
      year: parseInt(form.year.value, 10),
      section: 'B',
      password: form.password.value,
      role: 'STUDENT'
    };

    try {
      const res = await API.auth.registerStudent(data);
      Auth.setSession(res.user, res.token);
      this.showToast('Registration successful! Welcome to ACADEX.', 'success');
      window.location.hash = '#student-overview';
    } catch (err) {
      this.showToast(err.message || 'Registration could not be completed.', 'error');
    }
  },

  renderAppShell(viewName) {
    const root = document.getElementById('appRoot');
    const isStudent = Auth.isStudent();
    const user = Auth.currentUser;

    root.innerHTML = `
      <div class="app-container">
        
        <!-- Sidebar Navigation -->
        <aside class="app-sidebar" id="appSidebar">
          <div class="sidebar-header">
            <div class="brand-badge">
              <div class="brand-icon-box">${getIcon('graduationCap')}</div>
              <span>ACADEX</span>
              <span class="brand-tag">${isStudent ? 'STUDENT' : 'HOD'}</span>
            </div>
            <button class="mobile-menu-toggle" style="color: #94a3b8;" onclick="App.toggleSidebar()">
              ${getIcon('x')}
            </button>
          </div>

          <div class="sidebar-role-indicator">
            <div class="role-avatar">${user?.first_name ? user.first_name[0] : 'U'}</div>
            <div class="role-info">
              <div class="role-name">${user?.first_name} ${user?.last_name || ''}</div>
              <div class="role-title">
                <span class="role-status-dot"></span>
                ${isStudent ? user?.student_profile?.register_number || 'Student' : 'Head of Department'}
              </div>
            </div>
          </div>

          <nav class="sidebar-nav">
            ${isStudent ? this.getStudentNavItems(viewName) : this.getHODNavItems(viewName)}
          </nav>

          <div class="sidebar-footer">
            <button class="sidebar-logout-btn" onclick="Auth.logout()">
              ${getIcon('logout')} Sign Out
            </button>
          </div>
        </aside>

        <!-- Main Viewport -->
        <div class="app-main">
          
          <!-- Top Sticky Navbar -->
          <header class="app-navbar">
            <div class="navbar-left">
              <button class="mobile-menu-toggle" onclick="App.toggleSidebar()">
                ${getIcon('menu')}
              </button>
              <div class="page-breadcrumb">
                <span>ACADEX</span>
                <span>/</span>
                <span class="current">${this.formatViewTitle(viewName)}</span>
              </div>
            </div>

            <div class="navbar-right">
              <div class="navbar-search">
                ${getIcon('search')}
                <input type="text" placeholder="Search academic records..." />
              </div>
              <button class="action-icon-btn" onclick="App.showNotificationsDrop()">
                ${getIcon('bell')}
                <span class="action-badge-dot"></span>
              </button>
              <div class="user-profile-menu" onclick="App.navigateTo('${isStudent ? 'student-profile' : 'hod-overview'}')">
                <div class="user-avatar-small">${user?.first_name ? user.first_name[0] : 'U'}</div>
                <div class="user-text-small">
                  <div class="user-name-small">${user?.first_name}</div>
                  <div class="user-role-small">${isStudent ? 'Student' : 'HOD'}</div>
                </div>
              </div>
            </div>
          </header>

          <!-- Content Body -->
          <main class="content-viewport" id="mainContent"></main>
        </div>

      </div>

      <!-- Global Modal Backdrop -->
      <div class="modal-backdrop" id="modalBackdrop">
        <div class="modal-box" id="modalContent"></div>
      </div>

      <!-- Global Toast Container -->
      <div class="toast-container" id="toastContainer"></div>
    `;

    // Render the specific view into mainContent
    this.renderCurrentViewContent(viewName);
  },

  getStudentNavItems(view) {
    const items = [
      { id: 'student-overview', label: 'Overview', icon: 'dashboard', section: 'ACADEMICS' },
      { id: 'student-profile', label: 'My Profile', icon: 'user' },
      { id: 'student-attendance', label: 'Attendance', icon: 'checkCircle' },
      { id: 'student-timetable', label: 'Class Timetable', icon: 'calendar' },
      { id: 'student-marks', label: 'Internal Marks', icon: 'barChart' },
      
      { id: 'student-assignments', label: 'Assignments', icon: 'fileText', section: 'COURSEWORK' },
      { id: 'student-materials', label: 'Study Materials', icon: 'book' },
      { id: 'student-documents', label: 'Document Vault', icon: 'upload' },
      { id: 'student-leaves', label: 'Leave Requests', icon: 'clock' },
      { id: 'student-announcements', label: 'Notices & Circulars', icon: 'bell' }
    ];

    return this.buildNavHtml(items, view);
  },

  getHODNavItems(view) {
    const items = [
      { id: 'hod-overview', label: 'Department Analytics', icon: 'dashboard', section: 'MANAGEMENT' },
      { id: 'hod-students', label: 'Student Directory', icon: 'users' },
      { id: 'hod-attendance', label: 'Attendance Monitor', icon: 'checkCircle' },
      { id: 'hod-timetable', label: 'Timetable Control', icon: 'calendar' },
      
      { id: 'hod-leaves', label: 'Leave Approvals', icon: 'clock', section: 'ACADEMIC SERVICES' },
      { id: 'hod-assignments', label: 'Assignment Review', icon: 'fileText' },
      { id: 'hod-marks', label: 'Marks Management', icon: 'barChart' },
      { id: 'hod-materials', label: 'Course Materials', icon: 'book' },
      { id: 'hod-announcements', label: 'Publish Notices', icon: 'bell' }
    ];

    return this.buildNavHtml(items, view);
  },

  buildNavHtml(items, activeView) {
    let html = '';
    items.forEach(item => {
      if (item.section) {
        html += `<div class="nav-section-title">${item.section}</div>`;
      }
      const isActive = item.id === activeView;
      html += `
        <div class="nav-item ${isActive ? 'active' : ''}" onclick="App.navigateTo('${item.id}')">
          ${getIcon(item.icon)}
          <span>${item.label}</span>
        </div>
      `;
    });
    return html;
  },

  formatViewTitle(viewName) {
    return viewName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  },

  renderCurrentViewContent(viewName) {
    const container = document.getElementById('mainContent');
    if (!container) return;

    switch (viewName) {
      // Student Routes
      case 'student-overview':
        StudentModule.renderOverview(container);
        break;
      case 'student-profile':
        StudentModule.renderProfile(container);
        break;
      case 'student-attendance':
        StudentModule.renderAttendance(container);
        break;
      case 'student-timetable':
        StudentModule.renderTimetable(container);
        break;
      case 'student-announcements':
        StudentModule.renderAnnouncements(container);
        break;
      case 'student-assignments':
        StudentModule.renderAssignments(container);
        break;
      case 'student-materials':
        StudentModule.renderStudyMaterials(container);
        break;
      case 'student-documents':
        StudentModule.renderDocuments(container);
        break;
      case 'student-leaves':
        StudentModule.renderLeaves(container);
        break;
      case 'student-marks':
        StudentModule.renderMarks(container);
        break;

      // HOD Routes
      case 'hod-overview':
        HODModule.renderOverview(container);
        break;
      case 'hod-students':
        HODModule.renderStudents(container);
        break;
      case 'hod-attendance':
        HODModule.renderAttendanceManagement(container);
        break;
      case 'hod-timetable':
        HODModule.renderTimetableManagement(container);
        break;
      case 'hod-announcements':
        HODModule.renderAnnouncementsManagement(container);
        break;
      case 'hod-assignments':
        HODModule.renderAssignmentsManagement(container);
        break;
      case 'hod-materials':
        HODModule.renderMaterialsManagement(container);
        break;
      case 'hod-leaves':
        HODModule.renderLeaveApprovals(container);
        break;
      case 'hod-marks':
        HODModule.renderMarksManagement(container);
        break;

      default:
        container.innerHTML = `<div class="empty-state"><h3>Page not found</h3></div>`;
    }
  },

  navigateTo(viewName) {
    window.location.hash = `#${viewName}`;
    const sidebar = document.getElementById('appSidebar');
    sidebar?.classList.remove('mobile-open');
  },

  toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    sidebar?.classList.toggle('mobile-open');
  },

  openModal(html) {
    const backdrop = document.getElementById('modalBackdrop');
    const content = document.getElementById('modalContent');
    if (backdrop && content) {
      content.innerHTML = html;
      backdrop.classList.add('active');
    }
  },

  closeModal() {
    const backdrop = document.getElementById('modalBackdrop');
    backdrop?.classList.remove('active');
  },

  showToast(message, type = 'info', title = null) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'alertCircle';
    if (type === 'success') iconName = 'checkCircle';
    else if (type === 'error') iconName = 'xCircle';
    else if (type === 'warning') iconName = 'alertCircle';

    toast.innerHTML = `
      <div class="toast-icon">${getIcon(iconName)}</div>
      <div class="toast-content">
        <div class="toast-title">${title || (type.charAt(0).toUpperCase() + type.slice(1))}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  async showNotificationsDrop() {
    this.openModal('<div class="modal-body">Loading notifications…</div>');
    try {
      const notices = await API.notifications.list();
      const safe = (value = '') => { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; };
      this.openModal(`<div class="modal-header"><h3 class="modal-title">Notifications Inbox</h3><button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button></div><div class="modal-body">${notices.length ? notices.map(n => `<div style="padding:.75rem;margin-bottom:.5rem;background:var(--bg-surface-alt);border-radius:var(--radius-md)"><strong>${safe(n.title)}</strong><p>${safe(n.message)}</p></div>`).join('') : '<div class="empty-state"><p>No notifications yet.</p></div>'}</div><div class="modal-footer"><button class="btn btn-secondary" onclick="App.closeModal()">Close</button></div>`);
    } catch (error) {
      this.openModal(`<div class="modal-body"><h3>Unable to load notifications</h3><p>${error.message}</p></div>`);
    }
  }
};

// Initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
