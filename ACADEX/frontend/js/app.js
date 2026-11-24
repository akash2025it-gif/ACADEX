/**
 * ACADEX Master Application Controller & Router
 * Role-isolated routing, modern landing page, student registration, and unified app shell.
 */

const App = {
  currentView: null,
  selectedAuthRole: 'STUDENT',

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
    let hash = window.location.hash.slice(1);

    // Default unauthenticated landing
    if (!Auth.isAuthenticated()) {
      if (!hash || hash === 'landing') {
        this.renderLandingPage();
        return;
      }
      if (hash === 'register') {
        this.renderAuthView('register', 'STUDENT');
        return;
      }
      if (hash === 'login-hod') {
        this.selectedAuthRole = 'HOD';
        this.renderAuthView('login', 'HOD');
        return;
      }
      if (hash === 'login' || hash === 'login-student') {
        this.selectedAuthRole = 'STUDENT';
        this.renderAuthView('login', 'STUDENT');
        return;
      }
      // Any other unauthenticated route redirects to landing
      window.location.hash = '#landing';
      return;
    }

    // Role-based protection for authenticated users
    if (Auth.isStudent()) {
      if (hash.startsWith('hod-') || hash === 'login' || hash === 'login-hod' || hash === 'login-student' || hash === 'register' || hash === 'landing' || !hash) {
        window.location.hash = '#student-overview';
        return;
      }
      if (!hash.startsWith('student-')) {
        hash = 'student-overview';
      }
    } else if (Auth.isHOD()) {
      if (hash.startsWith('student-') || hash === 'login' || hash === 'login-hod' || hash === 'login-student' || hash === 'register' || hash === 'landing' || !hash) {
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

  /* -------------------------------------------------------------
     MODERN SAAS LANDING PAGE
     ------------------------------------------------------------- */
  renderLandingPage() {
    const root = document.getElementById('appRoot');
    root.innerHTML = `
      <div class="landing-wrapper">
        <!-- Top Navbar -->
        <header class="landing-nav">
          <a href="#landing" class="brand-logo">
            <div class="brand-icon-box">${getIcon('graduationCap')}</div>
            <span>ACADEX</span>
            <span class="brand-tag">PORTAL</span>
          </a>
          <div class="landing-nav-links">
            <a href="#login-student" class="btn btn-secondary btn-sm">${getIcon('user')} Student Portal</a>
            <a href="#login-hod" class="btn btn-primary btn-sm">${getIcon('award')} HOD Portal</a>
          </div>
        </header>

        <!-- Hero Section -->
        <main>
          <div class="landing-hero">
            <div class="hero-pill">
              ${getIcon('award')} Next-Generation Institutional Academic Platform
            </div>
            <h1 class="hero-title">
              Academic Excellence & Management <br />
              <span class="gradient-text">Unified for Students & HODs</span>
            </h1>
            <p class="hero-subtitle">
              Role-isolated academic operating system connecting students with departmental leadership. Real-time class attendance registers, document verification vault, coursework grading, and institutional analytics.
            </p>

            <!-- Quick Demo Credentials Banner -->
            <div class="demo-banner-box">
              <div class="demo-banner-header">
                <h4>${getIcon('award')} One-Click Evaluation & Demo Accounts</h4>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Click any account to instant-fill and test</span>
              </div>
              <div class="demo-pills-row">
                <!-- Demo Student -->
                <div class="demo-credential-card">
                  <div class="demo-credential-info">
                    <span class="demo-role-badge student">Student Account</span>
                    <strong class="demo-user-name">Alex Johnson (25IT104)</strong>
                    <span class="demo-user-meta">3rd Year B.Tech IT · 90% Attendance</span>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="App.quickLogin('25IT104', 'AcadexDemo2026!', 'STUDENT')">
                    Launch Student
                  </button>
                </div>

                <!-- Demo HOD -->
                <div class="demo-credential-card">
                  <div class="demo-credential-info">
                    <span class="demo-role-badge hod">Executive HOD Account</span>
                    <strong class="demo-user-name">Dr. K. Srinivasan (HOD)</strong>
                    <span class="demo-user-meta">hod.demo@acadex.example · IT Dept</span>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" onclick="App.quickLogin('hod.demo@acadex.example', 'AcadexDemo!Hod2026#7x', 'HOD')">
                    Launch HOD
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Two Portals Selection Grid -->
          <div class="portals-choice-grid">
            <!-- Student Portal Card -->
            <div class="portal-entry-card student-card">
              <div class="portal-icon-box">${getIcon('graduationCap')}</div>
              <div class="portal-badge-label">Student Academic Portal</div>
              <h3>Student Workspace</h3>
              <p>Personalized academic command center for continuous assessment, lecture timetable, document vault, and leave requests.</p>
              
              <ul class="portal-feature-list">
                <li class="portal-feature-item">${getIcon('checkCircle')} Real-time subject attendance & shortage warnings</li>
                <li class="portal-feature-item">${getIcon('checkCircle')} Coursework submissions with faculty feedback</li>
                <li class="portal-feature-item">${getIcon('checkCircle')} Official document vault for degree records & IDs</li>
                <li class="portal-feature-item">${getIcon('checkCircle')} Digital Leave & On-Duty (OD) application tracking</li>
              </ul>

              <div class="portal-card-actions">
                <a href="#login-student" class="btn btn-primary btn-lg" style="width: 100%;">
                  Sign In as Student
                </a>
                <a href="#register" class="btn btn-secondary" style="width: 100%; text-align: center;">
                  New Student Registration
                </a>
              </div>
            </div>

            <!-- HOD Executive Card -->
            <div class="portal-entry-card hod-card">
              <div class="portal-icon-box">${getIcon('building')}</div>
              <div class="portal-badge-label">Faculty & Department Leadership</div>
              <h3>HOD Command Center</h3>
              <p>Executive supervisory suite for student directory oversight, attendance batch registers, leave approvals, and gradebooks.</p>
              
              <ul class="portal-feature-list">
                <li class="portal-feature-item">${getIcon('checkCircle')} Department-wide attendance monitor & alert tracking</li>
                <li class="portal-feature-item">${getIcon('checkCircle')} Instant 1-click Leave & On-Duty (OD) approvals</li>
                <li class="portal-feature-item">${getIcon('checkCircle')} Coursework grading & continuous assessment marks</li>
                <li class="portal-feature-item">${getIcon('checkCircle')} Timetable management & departmental circular broadcasts</li>
              </ul>

              <div class="portal-card-actions">
                <a href="#login-hod" class="btn btn-primary btn-lg" style="width: 100%;">
                  Sign In as HOD
                </a>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0;">
                  Protected administrative access for department heads
                </div>
              </div>
            </div>
          </div>

          <!-- Platform Features Section -->
          <div class="features-section">
            <div class="section-header">
              <h2>Engineered for Modern Academic Institutions</h2>
              <p>High-integrity academic operations built on PostgreSQL, Django REST Framework, and cloud infrastructure.</p>
            </div>
            <div class="features-grid">
              <div class="feature-box">
                <div class="feature-icon-wrapper">${getIcon('checkCircle')}</div>
                <h4>Attendance Intelligence</h4>
                <p>Automated threshold monitoring alerts students and department heads when attendance dips below university exam criteria.</p>
              </div>
              <div class="feature-box">
                <div class="feature-icon-wrapper">${getIcon('upload')}</div>
                <h4>Verified Document Vault</h4>
                <p>Students securely store degree transcripts, identity records, and certificates verified with HOD digital review stamps.</p>
              </div>
              <div class="feature-box">
                <div class="feature-icon-wrapper">${getIcon('barChart')}</div>
                <h4>Continuous Assessment</h4>
                <p>Transparent CAT 1, CAT 2, and Model exam grade tracking with automatic GPA and letter grade projections.</p>
              </div>
              <div class="feature-box">
                <div class="feature-icon-wrapper">${getIcon('award')}</div>
                <h4>On-Duty (OD) Workflows</h4>
                <p>End-to-end digital tracking for symposiums, paper presentations, and hackathons with official departmental remarks.</p>
              </div>
            </div>
          </div>
        </main>

        <!-- Landing Footer -->
        <footer class="landing-footer">
          <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; gap: 1rem;">
            <div>
              <strong>ACADEX Academic Management Portal</strong> · Unified Campus Operating System
            </div>
            <div>
              Secure PostgreSQL Storage · Render Backend · Vercel Production
            </div>
          </div>
        </footer>
      </div>

      <div class="toast-container" id="toastContainer"></div>
    `;
  },

  /* -------------------------------------------------------------
     AUTHENTICATION VIEWS (LOGIN / REGISTRATION)
     ------------------------------------------------------------- */
  renderAuthView(viewName, role = 'STUDENT') {
    this.selectedAuthRole = role;
    const isRegister = viewName === 'register';
    const isHOD = role === 'HOD';

    const root = document.getElementById('appRoot');
    root.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <!-- Auth Header -->
          <div class="auth-header">
            <a href="#landing" class="auth-logo" style="text-decoration: none;">
              <div class="brand-icon-box">${getIcon('graduationCap')}</div>
              <span>ACADEX</span>
              <span class="brand-tag">${isHOD ? 'HOD' : 'PORTAL'}</span>
            </a>
            <h2>${isRegister ? 'Student Portal Registration' : isHOD ? 'HOD Department Sign In' : 'Student Portal Sign In'}</h2>
            <p>${isRegister ? 'Create your official student academic profile' : isHOD ? 'Authorized faculty access for department leadership' : 'Access your class attendance, timetable, and coursework'}</p>
          </div>

          <!-- Auth Role Selector (Only on Login) -->
          ${!isRegister ? `
            <div class="auth-role-tabs">
              <button type="button" class="auth-role-tab ${!isHOD ? 'active' : ''}" onclick="App.switchAuthRole('STUDENT')">
                ${getIcon('user')} Student Portal
              </button>
              <button type="button" class="auth-role-tab ${isHOD ? 'active' : ''}" onclick="App.switchAuthRole('HOD')">
                ${getIcon('award')} HOD Portal
              </button>
            </div>
          ` : ''}

          <!-- Auth Body -->
          <div class="auth-body">
            ${isRegister ? this.getRegisterFormHtml() : this.getLoginFormHtml(isHOD)}
          </div>

          <!-- Auth Footer -->
          <div class="auth-footer">
            ${isRegister ? `
              Already have an account? <a href="#login-student" style="font-weight: 600;">Sign in as Student</a>
            ` : isHOD ? `
              Student trying to sign in? <a href="#login-student" style="font-weight: 600;">Go to Student Login</a>
            ` : `
              New Student? <a href="#register" style="font-weight: 600;">Register Portal Account</a>
            `}
            <div style="margin-top: 0.75rem;">
              <a href="#landing" style="font-size: 0.8125rem; color: var(--text-muted); text-decoration: none;">
                ← Back to Portal Home
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="toast-container" id="toastContainer"></div>
    `;
  },

  switchAuthRole(role) {
    this.selectedAuthRole = role;
    window.location.hash = role === 'HOD' ? '#login-hod' : '#login-student';
  },

  getLoginFormHtml(isHOD) {
    return `
      <form id="loginForm" onsubmit="App.handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">
            ${isHOD ? 'Employee ID, Email or Username' : 'Register Number or Username'} 
            <span class="required">*</span>
          </label>
          <input 
            type="text" 
            class="form-control" 
            id="authLoginUsername" 
            name="username" 
            placeholder="${isHOD ? 'e.g. HOD-IT-01 or hod.demo@acadex.example' : 'e.g. 25IT104 or alex'}" 
            required 
          />
        </div>

        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.375rem;">
            <label class="form-label" style="margin: 0;">Password <span class="required">*</span></label>
            <a href="javascript:void(0)" onclick="App.showToast('Contact Institutional Administration for credential assistance.', 'info')" style="font-size: 0.75rem;">Forgot?</a>
          </div>
          <input 
            type="password" 
            class="form-control" 
            id="authLoginPassword" 
            name="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.25rem;">
          ${isHOD ? 'Authenticate as HOD' : 'Sign In to Student Portal'}
        </button>

        <!-- Quick Demo Fill Button -->
        <button 
          type="button" 
          class="demo-quick-fill-btn" 
          onclick="${isHOD ? "App.fillDemoCredentials('hod.demo@acadex.example', 'AcadexDemo!Hod2026#7x')" : "App.fillDemoCredentials('25IT104', 'AcadexDemo2026!')"}"
        >
          ${getIcon('award')} Fill Demo ${isHOD ? 'HOD' : 'Student'} Credentials
        </button>
      </form>
    `;
  },

  fillDemoCredentials(user, pass) {
    const uInput = document.getElementById('authLoginUsername');
    const pInput = document.getElementById('authLoginPassword');
    if (uInput && pInput) {
      uInput.value = user;
      pInput.value = pass;
      this.showToast(`Filled credentials for ${user}. Click Sign In to continue.`, 'info');
    }
  },

  async quickLogin(user, pass, role) {
    try {
      this.showToast(`Signing into ${role} demo…`, 'info');
      const res = await API.auth.login({ username: user, password: pass, role });
      Auth.setSession(res.user, res.token);
      this.showToast(`Signed in as ${res.user.first_name} (${role})!`, 'success');
      window.location.hash = role === 'HOD' ? '#hod-overview' : '#student-overview';
    } catch (err) {
      this.showToast(err.message || 'Quick login failed.', 'error');
    }
  },

  getRegisterFormHtml() {
    return `
      <form id="registerForm" onsubmit="App.handleRegisterSubmit(event)" style="display: flex; flex-direction: column; gap: 0.875rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">First Name <span class="required">*</span></label>
            <input type="text" class="form-control" name="first_name" placeholder="Aarav" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name <span class="required">*</span></label>
            <input type="text" class="form-control" name="last_name" placeholder="Kumar" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Register Number <span class="required">*</span></label>
            <input type="text" class="form-control" name="register_number" placeholder="25IT120" required />
          </div>
          <div class="form-group">
            <label class="form-label">Official Email <span class="required">*</span></label>
            <input type="email" class="form-control" name="email" placeholder="aarav.k@acadex.edu" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Department <span class="required">*</span></label>
            <select class="form-control" name="department" required>
              <option value="Information Technology" selected>Information Technology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics & Comm">Electronics & Comm</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Academic Year <span class="required">*</span></label>
            <select class="form-control" name="year" required>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3" selected>Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Section <span class="required">*</span></label>
            <select class="form-control" name="section">
              <option value="B" selected>Section B</option>
              <option value="A">Section A</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Contact</label>
            <input type="tel" class="form-control" name="phone" placeholder="+91 98765 43220" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password (at least 8 characters) <span class="required">*</span></label>
          <input type="password" class="form-control" name="password" minlength="8" placeholder="••••••••" required />
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password <span class="required">*</span></label>
          <input type="password" class="form-control" name="confirm_password" minlength="8" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.25rem;">
          Complete Student Registration
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
      const res = await API.auth.login({ username, password, role });
      Auth.setSession(res.user, res.token);
      this.showToast('Signed in successfully!', 'success');
      window.location.hash = res.user.role === 'HOD' ? '#hod-overview' : '#student-overview';
    } catch (err) {
      this.showToast(err.message || 'Invalid credentials. Please verify your ID and password.', 'error');
    }
  },

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const password = form.password.value;
    const confirmPassword = form.confirm_password.value;

    if (password !== confirmPassword) {
      this.showToast('Passwords do not match. Please re-enter identical passwords.', 'error');
      return;
    }

    const regNo = form.register_number.value.trim();
    const data = {
      username: regNo,
      register_number: regNo,
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      email: form.email.value.trim(),
      department: form.department.value,
      year: parseInt(form.year.value, 10),
      section: form.section.value,
      phone: form.phone.value.trim(),
      password: password,
      role: 'STUDENT'
    };

    try {
      const res = await API.auth.registerStudent(data);
      Auth.setSession(res.user, res.token);
      this.showToast(`Registration successful! Welcome, ${res.user.first_name}.`, 'success');
      window.location.hash = '#student-overview';
    } catch (err) {
      this.showToast(err.message || 'Registration failed. Check your details.', 'error');
    }
  },

  /* -------------------------------------------------------------
     AUTHENTICATED APPLICATION SHELL
     ------------------------------------------------------------- */
  renderAppShell(viewName) {
    const root = document.getElementById('appRoot');
    const isStudent = Auth.isStudent();
    const user = Auth.currentUser;
    const p = isStudent ? (user?.student_profile || {}) : (user?.hod_profile || {});

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
            <div class="role-avatar">${user?.first_name ? user.first_name[0] : (isStudent ? 'S' : 'H')}</div>
            <div class="role-info">
              <div class="role-name">${this.escape(user?.first_name || '')} ${this.escape(user?.last_name || '')}</div>
              <div class="role-title">
                <span class="role-status-dot"></span>
                ${isStudent ? this.escape(p.register_number || 'Student') : 'Head of Department'}
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
              <button class="action-icon-btn" onclick="App.showNotificationsDrop()" title="Notifications">
                ${getIcon('bell')}
                <span class="action-badge-dot"></span>
              </button>
              <div class="user-profile-menu" onclick="App.navigateTo('${isStudent ? 'student-profile' : 'hod-overview'}')">
                <div class="user-avatar-small">${user?.first_name ? user.first_name[0] : (isStudent ? 'S' : 'H')}</div>
                <div class="user-text-small">
                  <div class="user-name-small">${this.escape(user?.first_name || '')}</div>
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

  escape(v = '') {
    const e = document.createElement('span');
    e.textContent = String(v);
    return e.innerHTML;
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
      { id: 'student-announcements', label: 'Notices & Circulars', icon: 'bell' },
      { id: 'student-settings', label: 'Account Settings', icon: 'settings' }
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
      { id: 'hod-documents', label: 'Document Verification', icon: 'upload' },
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
      case 'student-settings':
        StudentModule.renderSettings(container);
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
      case 'hod-documents':
        HODModule.renderDocumentVerification(container);
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
    this.openModal('<div class="modal-body">Loading notification alerts…</div>');
    try {
      const notices = await API.notifications.list();
      const safe = (value = '') => { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; };
      this.openModal(`
        <div class="modal-header">
          <h3 class="modal-title">Official Notification Inbox</h3>
          <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
        </div>
        <div class="modal-body" style="padding: 1rem; max-height: 400px; overflow-y: auto;">
          ${notices.length ? notices.map(n => `
            <div style="padding: 0.875rem; margin-bottom: 0.625rem; background: var(--bg-surface-alt); border-radius: var(--radius-md); border-left: 3px solid var(--accent-indigo);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <strong style="color: var(--primary-navy); font-size: 0.9375rem;">${safe(n.title)}</strong>
                <span class="status-badge badge-info">${safe(n.notif_type)}</span>
              </div>
              <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; margin: 0 0 0.35rem;">
                ${safe(n.message)}
              </p>
              <span style="font-size: 0.6875rem; color: var(--text-subtle);">${safe(n.created_at?.slice(0, 10) || 'Recent')}</span>
            </div>
          `).join('') : '<div class="empty-state"><p>No unread notifications.</p></div>'}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="App.closeModal()">Close</button>
        </div>
      `);
    } catch (error) {
      this.openModal(`<div class="modal-body"><h3>Unable to load notifications</h3><p>${error.message}</p></div>`);
    }
  }
};

// Initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
