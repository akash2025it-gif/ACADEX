/**
 * ACADEX Student Module Controller
 * Complete Student Academic Dashboard
 */

const StudentModule = {
  // Mock fallback data for instant demo and offline resilience
  mockData: {
    profile: {
      user: { first_name: 'Alex', last_name: 'Johnson', email: 'alex.j@acadex.edu' },
      register_number: '25IT104',
      department: 'Information Technology',
      course: 'B.Tech IT',
      year: 3,
      section: 'B',
      phone: '+91 98765 43210',
      date_of_birth: '2004-06-15',
      address: '742 Evergreen Terrace, Tech Park City',
      profile_photo: null
    },
    attendance: {
      total_classes: 120,
      attended_classes: 106,
      percentage: 88.3,
      subjects: [
        { code: 'IT601', name: 'Database Management Systems', total: 24, attended: 22, percentage: 91.6 },
        { code: 'IT602', name: 'Web Technology & Cloud', total: 26, attended: 24, percentage: 92.3 },
        { code: 'IT603', name: 'Design & Analysis of Algorithms', total: 22, attended: 18, percentage: 81.8 },
        { code: 'IT604', name: 'Computer Networks', total: 24, attended: 21, percentage: 87.5 },
        { code: 'IT605', name: 'Artificial Intelligence & ML', total: 24, attended: 21, percentage: 87.5 }
      ],
      history: [
        { date: '2026-11-14', subject: 'Database Management Systems', status: 'PRESENT', period: '1 & 2' },
        { date: '2026-11-14', subject: 'Computer Networks', status: 'PRESENT', period: '3 & 4' },
        { date: '2026-11-13', subject: 'Web Technology & Cloud', status: 'PRESENT', period: '1 & 2' },
        { date: '2026-11-13', subject: 'Design & Analysis of Algorithms', status: 'ABSENT', period: '3' },
        { date: '2026-11-12', subject: 'AI & Machine Learning', status: 'OD', period: '5 & 6' }
      ]
    },
    timetable: [
      { day: 'Monday', slots: ['DBMS', 'DBMS', 'Web Tech', 'Web Tech', 'Networks', 'Lab', 'Lab', 'Library'] },
      { day: 'Tuesday', slots: ['DAA', 'DAA', 'Networks', 'DBMS', 'AI/ML', 'AI/ML', 'Sports', 'Mentor'] },
      { day: 'Wednesday', slots: ['Web Tech', 'AI/ML', 'DBMS', 'DAA', 'Networks Lab', 'Networks Lab', 'Networks Lab', 'Seminar'] },
      { day: 'Thursday', slots: ['Networks', 'DBMS', 'AI/ML', 'Web Tech', 'Web Lab', 'Web Lab', 'Web Lab', 'Counselling'] },
      { day: 'Friday', slots: ['AI/ML', 'Networks', 'DAA', 'DBMS', 'DAA Lab', 'DAA Lab', 'Placement', 'Placement'] }
    ],
    announcements: [
      { id: 1, title: 'Mid-Semester Examination Schedule Announced', message: 'The Mid-Semester Examination for Semester V will commence from Nov 28, 2026. Hall tickets available on the portal.', priority: 'URGENT', audience: 'ALL', author: 'Dr. R. Ramanathan, HOD', created_at: '2026-11-14' },
      { id: 2, title: 'Department Hackathon: ACADEX INNOVATE 2026', message: 'All 3rd and 4th year IT students are encouraged to register their teams for the 24-hr Hackathon before Nov 20.', priority: 'IMPORTANT', audience: 'DEPARTMENT', author: 'IT Department', created_at: '2026-11-12' },
      { id: 3, title: 'Guest Lecture on Cloud Computing Architecture', message: 'Industry expert lecture scheduled for Friday, 2 PM at Seminar Hall A. Attendance mandatory.', priority: 'NORMAL', audience: 'YEAR', author: 'Faculty Coordinator', created_at: '2026-11-10' }
    ],
    assignments: [
      { id: 1, title: 'DBMS ER-Diagram & Normalization Project', subject: 'Database Management Systems', due_date: '2026-11-22', status: 'PENDING', description: 'Design a complete 3NF schema for a Hospital Management System including ER Diagrams and DDL scripts.', max_score: 50 },
      { id: 2, title: 'Responsive Dashboard Design in React/HTML5', subject: 'Web Technology & Cloud', due_date: '2026-11-25', status: 'SUBMITTED', score: 48, feedback: 'Excellent layout and clean responsiveness.', max_score: 50 },
      { id: 3, title: 'Dynamic Programming vs Greedy Algorithms Case Study', subject: 'Design & Analysis of Algorithms', due_date: '2026-11-30', status: 'PENDING', description: 'Solve and implement the 0/1 Knapsack problem with complexity benchmark graphs.', max_score: 50 }
    ],
    materials: [
      { id: 1, title: 'Unit 3: Relational Calculus & Query Optimization', subject: 'Database Management Systems', teacher: 'Dr. M. Sridhar', file_size: '3.4 MB', updated_at: '2026-11-10' },
      { id: 2, title: 'Complete Guide to RESTful APIs & JWT Auth', subject: 'Web Technology & Cloud', teacher: 'Prof. K. Anand', file_size: '5.1 MB', updated_at: '2026-11-08' },
      { id: 3, title: 'Graph Algorithms & Shortest Path Notes', subject: 'Design & Analysis of Algorithms', teacher: 'Dr. P. Varma', file_size: '2.8 MB', updated_at: '2026-11-05' }
    ],
    documents: [
      { id: 1, title: 'College Identity Card Verification', document_type: 'College ID', status: 'APPROVED', uploaded_at: '2026-08-15', reviewer_comments: 'Identity verified with college records.' },
      { id: 2, title: 'Semester 4 Consolidated Marksheet', document_type: 'Marksheet', status: 'APPROVED', uploaded_at: '2026-09-02', reviewer_comments: 'Verified.' },
      { id: 3, title: 'AWS Cloud Practitioner Certificate', document_type: 'Certificate', status: 'PENDING', uploaded_at: '2026-11-11', reviewer_comments: 'Under review by HOD.' }
    ],
    leaves: [
      { id: 1, leave_type: 'Medical Leave', reason: 'High fever and viral infection doctor advised 2 days rest', from_date: '2026-10-18', to_date: '2026-10-19', status: 'APPROVED', hod_comments: 'Take care. Medical certificate verified.' },
      { id: 2, leave_type: 'On Duty (OD)', reason: 'Attending Inter-College Smart India Hackathon zonal round', from_date: '2026-11-24', to_date: '2026-11-25', status: 'PENDING', hod_comments: 'Pending review.' }
    ],
    marks: [
      { subject: 'Database Management Systems', code: 'IT601', midterm1: 46, midterm2: 48, model: 92, assignment: 10, total: 96, grade: 'O' },
      { subject: 'Web Technology & Cloud', code: 'IT602', midterm1: 44, midterm2: 45, model: 88, assignment: 10, total: 91, grade: 'A+' },
      { subject: 'Design & Analysis of Algorithms', code: 'IT603', midterm1: 40, midterm2: 42, model: 82, assignment: 9, total: 85, grade: 'A+' },
      { subject: 'Computer Networks', code: 'IT604', midterm1: 45, midterm2: 47, model: 90, assignment: 10, total: 94, grade: 'O' },
      { subject: 'Artificial Intelligence & ML', code: 'IT605', midterm1: 43, midterm2: 44, model: 86, assignment: 9, total: 89, grade: 'A+' }
    ]
  },

  // 1. Student Dashboard Overview View
  async renderOverview(container) {
    let student = Auth.currentUser?.student_profile || this.mockData.profile;
    let attendance = this.mockData.attendance;
    let announcements = this.mockData.announcements;
    let assignments = this.mockData.assignments;

    // Try fetching live data if API token exists
    try {
      const summary = await API.attendance.getStudentSummary().catch(() => null);
      if (summary) attendance.percentage = summary.percentage || attendance.percentage;
    } catch(e) {}

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Welcome back, ${Auth.currentUser?.first_name || student.user?.first_name || 'Student'}</h1>
          <p>${student.course || 'B.Tech IT'} • Year ${student.year || 3} - Section ${student.section || 'A'} • Reg No: <strong>${student.register_number || '25IT104'}</strong></p>
        </div>
        <div class="page-actions-box">
          <button class="btn btn-secondary" onclick="App.navigateTo('student-timetable')">
            ${getIcon('calendar')} View Timetable
          </button>
          <button class="btn btn-primary" onclick="StudentModule.openApplyLeaveModal()">
            ${getIcon('plus')} Apply Leave
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card ${attendance.percentage >= 75 ? 'variant-success' : 'variant-danger'}">
          <div class="stat-content">
            <span class="stat-label">Attendance Rate</span>
            <div class="stat-value">${attendance.percentage}%</div>
            <span class="stat-subtext">
              ${attendance.percentage >= 75 ? `${getIcon('checkCircle')} Above 75% threshold` : `${getIcon('alertCircle')} Low attendance alert`}
            </span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('users')}</div>
        </div>

        <div class="stat-card variant-info">
          <div class="stat-content">
            <span class="stat-label">Enrolled Courses</span>
            <div class="stat-value">${attendance.subjects.length}</div>
            <span class="stat-subtext">${getIcon('book')} Semester V Core Subjects</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('book')}</div>
        </div>

        <div class="stat-card variant-warning">
          <div class="stat-content">
            <span class="stat-label">Pending Tasks</span>
            <div class="stat-value">${assignments.filter(a => a.status === 'PENDING').length}</div>
            <span class="stat-subtext">${getIcon('clock')} Submissions due this week</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('fileText')}</div>
        </div>

        <div class="stat-card variant-success">
          <div class="stat-content">
            <span class="stat-label">Verified Documents</span>
            <div class="stat-value">3 / 3</div>
            <span class="stat-subtext">${getIcon('checkCircle')} HOD verified records</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('checkCircle')}</div>
        </div>
      </div>

      <!-- Grid: Today's Schedule & Recent Announcements -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- Today's Schedule Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('calendar')} Today's Schedule (Monday)</div>
            <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('student-timetable')">Full Timetable</button>
          </div>
          <div class="card-body" style="padding: 1rem 1.5rem;">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--bg-surface-alt); border-radius: var(--radius-md);">
                <div>
                  <div style="font-weight: 600; font-size: 0.9rem;">Database Management Systems</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Period 1 & 2 (09:00 AM - 10:40 AM) • Dr. M. Sridhar</div>
                </div>
                <span class="badge badge-info">LH-302</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--bg-surface-alt); border-radius: var(--radius-md);">
                <div>
                  <div style="font-weight: 600; font-size: 0.9rem;">Web Technology & Cloud Computing</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Period 3 & 4 (11:00 AM - 12:40 PM) • Prof. K. Anand</div>
                </div>
                <span class="badge badge-info">LH-302</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--bg-surface-alt); border-radius: var(--radius-md);">
                <div>
                  <div style="font-weight: 600; font-size: 0.9rem;">Computer Networks Laboratory</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Period 5 & 6 (01:30 PM - 03:10 PM) • Networks Lab 2</div>
                </div>
                <span class="badge badge-info">Lab 2</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Announcements Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('bell')} Academic Announcements</div>
            <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('student-announcements')">View All</button>
          </div>
          <div class="card-body" style="padding: 1rem 1.5rem;">
            <div style="display: flex; flex-direction: column; gap: 0.875rem;">
              ${announcements.slice(0, 3).map(a => `
                <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <span class="badge ${a.priority === 'URGENT' ? 'badge-danger' : a.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-neutral'}">${a.priority}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${a.created_at}</span>
                  </div>
                  <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main); margin-bottom: 2px;">${a.title}</div>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4;">${a.message}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Links Section -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">${getIcon('folder')} Quick Student Actions</div>
        </div>
        <div class="card-body" style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick="App.navigateTo('student-attendance')">
            ${getIcon('users')} Attendance Records
          </button>
          <button class="btn btn-secondary" onclick="App.navigateTo('student-assignments')">
            ${getIcon('fileText')} Submit Assignments
          </button>
          <button class="btn btn-secondary" onclick="App.navigateTo('student-materials')">
            ${getIcon('book')} Study Materials
          </button>
          <button class="btn btn-secondary" onclick="App.navigateTo('student-documents')">
            ${getIcon('upload')} Upload Documents
          </button>
          <button class="btn btn-secondary" onclick="App.navigateTo('student-marks')">
            ${getIcon('barChart')} Internal Marks
          </button>
          <button class="btn btn-secondary" onclick="App.navigateTo('student-leaves')">
            ${getIcon('clock')} Leave Status
          </button>
        </div>
      </div>
    `;
  },

  // 2. Student Profile View
  renderProfile(container) {
    let student = Auth.currentUser?.student_profile || this.mockData.profile;
    let user = Auth.currentUser || { first_name: 'Alex', last_name: 'Johnson', email: 'alex.j@acadex.edu' };

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Student Academic Profile</h1>
          <p>Personal, Academic and Department Enrollment Details</p>
        </div>
        <button class="btn btn-primary" onclick="StudentModule.openEditProfileModal()">
          ${getIcon('edit')} Edit Profile Details
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem;">
        <!-- Left Profile Identity Card -->
        <div class="card" style="text-align: center; padding: 2rem 1.5rem;">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #0f172a); color: white; display: flex; align-items: center; justify-content: center; font-size: 2.25rem; font-weight: 700; margin: 0 auto 1.25rem; box-shadow: var(--shadow-md);">
            ${user.first_name ? user.first_name[0] : 'S'}
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 700;">${user.first_name} ${user.last_name}</h2>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.75rem;">${student.register_number || '25IT104'}</p>
          <span class="badge badge-success" style="margin-bottom: 1.5rem;">Active Enrolled Student</span>

          <div style="text-align: left; border-top: 1px solid var(--border-light); padding-top: 1.25rem; font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div><span style="color: var(--text-muted);">Department:</span> <strong>${student.department}</strong></div>
            <div><span style="color: var(--text-muted);">Course:</span> <strong>${student.course || 'B.Tech IT'}</strong></div>
            <div><span style="color: var(--text-muted);">Year & Sec:</span> <strong>Year ${student.year} - Sec ${student.section}</strong></div>
            <div><span style="color: var(--text-muted);">Email:</span> <strong>${user.email}</strong></div>
            <div><span style="color: var(--text-muted);">Phone:</span> <strong>${student.phone}</strong></div>
          </div>
        </div>

        <!-- Right Detailed Information -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('fileText')} Complete Student Record</div>
          </div>
          <div class="card-body">
            <h3 style="font-size: 0.9375rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 1rem; letter-spacing: 0.05em;">Academic Information</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 2rem;">
              <div>
                <label class="form-label" style="color: var(--text-muted); font-size: 0.8125rem;">Register Number</label>
                <div style="font-weight: 600;">${student.register_number}</div>
              </div>
              <div>
                <label class="form-label" style="color: var(--text-muted); font-size: 0.8125rem;">Degree & Program</label>
                <div style="font-weight: 600;">${student.course || 'B.Tech Information Technology'}</div>
              </div>
              <div>
                <label class="form-label" style="color: var(--text-muted); font-size: 0.8125rem;">Academic Year</label>
                <div style="font-weight: 600;">Year ${student.year} (Semester V)</div>
              </div>
              <div>
                <label class="form-label" style="color: var(--text-muted); font-size: 0.8125rem;">Class Section</label>
                <div style="font-weight: 600;">Section ${student.section}</div>
              </div>
            </div>

            <h3 style="font-size: 0.9375rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 1rem; letter-spacing: 0.05em;">Personal & Contact Details</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
              <div>
                <label class="form-label" style="color: var(--text-muted); font-size: 0.8125rem;">Official College Email</label>
                <div style="font-weight: 600;">${user.email}</div>
              </div>
              <div>
                <label class="form-label" style="color: var(--text-muted); font-size: 0.8125rem;">Contact Mobile Number</label>
                <div style="font-weight: 600;">${student.phone}</div>
              </div>
              <div>
                <label class="form-label" style="color: var(--text-muted); font-size: 0.8125rem;">Date of Birth</label>
                <div style="font-weight: 600;">${student.date_of_birth || '2004-06-15'}</div>
              </div>
              <div>
                <label class="form-label" style="color: var(--text-muted); font-size: 0.8125rem;">Residential Address</label>
                <div style="font-weight: 600;">${student.address || 'Tech Park Campus Road, Chennai'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 3. Attendance Overview & History View
  renderAttendance(container) {
    let attendance = this.mockData.attendance;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Attendance Management</h1>
          <p>Subject-wise attendance breakdown and daily attendance verification</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card ${attendance.percentage >= 75 ? 'variant-success' : 'variant-danger'}">
          <div class="stat-content">
            <span class="stat-label">Cumulative Attendance</span>
            <div class="stat-value">${attendance.percentage}%</div>
            <span class="stat-subtext">${attendance.attended_classes} attended out of ${attendance.total_classes} conducted</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('checkCircle')}</div>
        </div>
        <div class="stat-card variant-info">
          <div class="stat-content">
            <span class="stat-label">Minimum Required</span>
            <div class="stat-value">75.0%</div>
            <span class="stat-subtext">University examination eligibility rule</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('award')}</div>
        </div>
        <div class="stat-card variant-success">
          <div class="stat-content">
            <span class="stat-label">On-Duty Approved</span>
            <div class="stat-value">4 Sessions</div>
            <span class="stat-subtext">Counted towards attendance credit</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('clock')}</div>
        </div>
      </div>

      <!-- Subject-Wise Attendance Breakdown Table -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <div class="card-title">${getIcon('book')} Subject-Wise Attendance Overview</div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Title</th>
                <th>Conducted</th>
                <th>Attended</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.subjects.map(s => `
                <tr>
                  <td><strong>${s.code}</strong></td>
                  <td>${s.name}</td>
                  <td>${s.total}</td>
                  <td>${s.attended}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <span style="font-weight: 600; width: 45px;">${s.percentage}%</span>
                      <div class="progress-bar-container" style="width: 100px; margin: 0;">
                        <div class="progress-bar-fill ${s.percentage >= 75 ? 'fill-success' : 'fill-danger'}" style="width: ${s.percentage}%;"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${s.percentage >= 75 ? 'badge-success' : 'badge-danger'}">
                      <span class="badge-dot"></span> ${s.percentage >= 75 ? 'Eligible' : 'Shortage'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detailed Attendance History Log -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">${getIcon('calendar')} Recent Attendance Logs</div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Period</th>
                <th>Course / Subject</th>
                <th>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.history.map(h => `
                <tr>
                  <td>${h.date}</td>
                  <td>${h.period}</td>
                  <td><strong>${h.subject}</strong></td>
                  <td>
                    <span class="badge ${h.status === 'PRESENT' ? 'badge-success' : h.status === 'OD' ? 'badge-info' : 'badge-danger'}">
                      <span class="badge-dot"></span> ${h.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // 4. Timetable View
  renderTimetable(container) {
    let timetable = this.mockData.timetable;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Weekly Class Timetable</h1>
          <p>Department of Information Technology • Semester V • Section B</p>
        </div>
      </div>

      <div class="card">
        <div class="card-body" style="overflow-x: auto;">
          <div class="timetable-grid">
            <div class="timetable-header">Day / Time</div>
            <div class="timetable-header">09:00 - 09:50</div>
            <div class="timetable-header">09:50 - 10:40</div>
            <div class="timetable-header">11:00 - 11:50</div>
            <div class="timetable-header">11:50 - 12:40</div>
            <div class="timetable-header">01:30 - 02:20</div>
            <div class="timetable-header">02:20 - 03:10</div>

            ${timetable.map(row => `
              <div style="font-weight: 700; background: var(--bg-surface-alt); padding: 0.75rem; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">
                ${row.day}
              </div>
              ${row.slots.slice(0, 6).map(slot => `
                <div class="timetable-slot">
                  <div class="slot-subject">${slot}</div>
                  <div class="slot-teacher">IT Dept</div>
                  <span class="slot-room">LH-302</span>
                </div>
              `).join('')}
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // 5. Academic Announcements View
  renderAnnouncements(container) {
    let announcements = this.mockData.announcements;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Academic Announcements & Notices</h1>
          <p>Official communications from the Head of Department and Academic Dean</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${announcements.map(a => `
          <div class="card" style="border-left: 4px solid ${a.priority === 'URGENT' ? 'var(--danger)' : a.priority === 'IMPORTANT' ? 'var(--warning)' : 'var(--accent-indigo)'};">
            <div class="card-header" style="background: transparent;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="badge ${a.priority === 'URGENT' ? 'badge-danger' : a.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-neutral'}">${a.priority}</span>
                <span class="badge badge-info">${a.audience}</span>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">${a.title}</h3>
              </div>
              <span style="font-size: 0.8125rem; color: var(--text-muted);">${a.created_at}</span>
            </div>
            <div class="card-body">
              <p style="font-size: 0.9375rem; color: var(--text-main); line-height: 1.6; margin-bottom: 0.75rem;">${a.message}</p>
              <div style="font-size: 0.8125rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
                ${getIcon('user')} Published by: <strong>${a.author}</strong>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 6. Assignments & Submissions View
  renderAssignments(container) {
    let assignments = this.mockData.assignments;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Course Assignments & Projects</h1>
          <p>Track deadlines, view problem statements and submit your work</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
        ${assignments.map(a => `
          <div class="card">
            <div class="card-header">
              <span class="badge badge-info">${a.subject}</span>
              <span class="badge ${a.status === 'SUBMITTED' ? 'badge-success' : 'badge-warning'}">
                ${a.status === 'SUBMITTED' ? `${getIcon('checkCircle')} Submitted` : `${getIcon('clock')} Pending`}
              </span>
            </div>
            <div class="card-body">
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">${a.title}</h3>
              <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">${a.description || 'Download problem brief and submit solution before the due date.'}</p>
              
              <div style="font-size: 0.8125rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1.25rem;">
                <div><strong>Due Date:</strong> ${a.due_date}</div>
                <div><strong>Maximum Marks:</strong> ${a.max_score} Points</div>
                ${a.score !== undefined ? `<div style="color: var(--success); font-weight: 600;">Grade / Score: ${a.score} / ${a.max_score} (${a.feedback})</div>` : ''}
              </div>

              ${a.status === 'PENDING' ? `
                <button class="btn btn-primary" style="width: 100%;" onclick="StudentModule.openSubmitAssignmentModal(${a.id}, '${a.title}')">
                  ${getIcon('upload')} Submit Assignment
                </button>
              ` : `
                <button class="btn btn-secondary" style="width: 100%;" disabled>
                  ${getIcon('checkCircle')} Submission Completed
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 7. Study Materials View
  renderStudyMaterials(container) {
    let materials = this.mockData.materials;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Department Study Materials & Lecture Notes</h1>
          <p>Curated syllabi, lecture slides, question banks and lab manuals</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Document / Material Title</th>
              <th>Course Subject</th>
              <th>Faculty</th>
              <th>File Size</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${materials.map(m => `
              <tr>
                <td><strong>${m.title}</strong></td>
                <td><span class="badge badge-info">${m.subject}</span></td>
                <td>${m.teacher}</td>
                <td>${m.file_size}</td>
                <td>${m.updated_at}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="App.showToast('Download started for: ${m.title}', 'info')">
                    ${getIcon('download')} Download
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 8. Documents Upload & Verification View
  renderDocuments(container) {
    let documents = this.mockData.documents;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Student Document Verification</h1>
          <p>Upload mandatory academic certificates and track HOD approval status</p>
        </div>
        <button class="btn btn-primary" onclick="StudentModule.openUploadDocumentModal()">
          ${getIcon('upload')} Upload New Document
        </button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Document Title</th>
              <th>Type</th>
              <th>Uploaded Date</th>
              <th>Verification Status</th>
              <th>HOD Review Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${documents.map(d => `
              <tr>
                <td><strong>${d.title}</strong></td>
                <td><span class="badge badge-neutral">${d.document_type}</span></td>
                <td>${d.uploaded_at}</td>
                <td>
                  <span class="badge ${d.status === 'APPROVED' ? 'badge-success' : d.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}">
                    <span class="badge-dot"></span> ${d.status}
                  </span>
                </td>
                <td>${d.reviewer_comments || 'Pending evaluation.'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 9. Leave Request Submission & Tracking View
  renderLeaves(container) {
    let leaves = this.mockData.leaves;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Leave & On-Duty (OD) Requests</h1>
          <p>Submit leave applications and monitor approval from the Head of Department</p>
        </div>
        <button class="btn btn-primary" onclick="StudentModule.openApplyLeaveModal()">
          ${getIcon('plus')} Apply Leave Request
        </button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Duration (From - To)</th>
              <th>Reason for Leave</th>
              <th>Status</th>
              <th>HOD Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${leaves.map(l => `
              <tr>
                <td><strong>${l.leave_type}</strong></td>
                <td>${l.from_date} to ${l.to_date}</td>
                <td>${l.reason}</td>
                <td>
                  <span class="badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}">
                    <span class="badge-dot"></span> ${l.status}
                  </span>
                </td>
                <td>${l.hod_comments || 'Under consideration.'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 10. Internal Marks & Academic Performance View
  renderMarks(container) {
    let marks = this.mockData.marks;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Internal Marks & Academic Performance</h1>
          <p>Continuous Assessment Test results, Model Examinations and Assignment Credits</p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <div class="card-title">${getIcon('barChart')} Semester V Continuous Assessment Record</div>
          <span class="badge badge-success">Overall Percentage: 91.0%</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Midterm 1 (50)</th>
                <th>Midterm 2 (50)</th>
                <th>Model Exam (100)</th>
                <th>Assignment (10)</th>
                <th>Calculated Total (100)</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${marks.map(m => `
                <tr>
                  <td><strong>${m.subject}</strong><br><small style="color: var(--text-muted);">${m.code}</small></td>
                  <td>${m.midterm1} / 50</td>
                  <td>${m.midterm2} / 50</td>
                  <td>${m.model} / 100</td>
                  <td>${m.assignment} / 10</td>
                  <td><strong>${m.total}</strong></td>
                  <td><span class="badge badge-success">${m.grade}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Modal Handlers
  openApplyLeaveModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Apply for Student Leave / OD</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form id="applyLeaveForm" onsubmit="StudentModule.submitLeaveForm(event)">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Leave Type <span class="required">*</span></label>
            <select class="form-control" name="leave_type" required>
              <option value="Medical Leave">Medical Leave</option>
              <option value="On Duty (OD)">On Duty (OD) - Sports / Hackathon / Symposium</option>
              <option value="Casual Leave">Casual Leave / Family Emergency</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">From Date <span class="required">*</span></label>
              <input type="date" class="form-control" name="from_date" required />
            </div>
            <div class="form-group">
              <label class="form-label">To Date <span class="required">*</span></label>
              <input type="date" class="form-control" name="to_date" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Reason for Absence <span class="required">*</span></label>
            <textarea class="form-control" name="reason" placeholder="Explain the reason for leave clearly for HOD review..." required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${getIcon('send')} Submit Leave Application</button>
        </div>
      </form>
    `);
  },

  submitLeaveForm(e) {
    e.preventDefault();
    const form = e.target;
    const leaveData = {
      id: Date.now(),
      leave_type: form.leave_type.value,
      from_date: form.from_date.value,
      to_date: form.to_date.value,
      reason: form.reason.value,
      status: 'PENDING',
      hod_comments: 'Pending evaluation by Head of Department.'
    };

    // Save to local mock state and attempt backend API dispatch
    this.mockData.leaves.unshift(leaveData);
    API.leaves.apply(leaveData).catch(() => {});

    App.closeModal();
    App.showToast('Leave request submitted successfully!', 'success');
    if (App.currentView === 'student-leaves') {
      this.renderLeaves(document.getElementById('mainContent'));
    }
  },

  openUploadDocumentModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Upload Academic Document</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form id="uploadDocForm" onsubmit="StudentModule.submitDocUpload(event)">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Document Title <span class="required">*</span></label>
            <input type="text" class="form-control" name="title" placeholder="e.g. 10th Standard Marksheet / Transfer Certificate" required />
          </div>
          <div class="form-group">
            <label class="form-label">Document Category <span class="required">*</span></label>
            <select class="form-control" name="document_type" required>
              <option value="College ID">College Identity Card</option>
              <option value="Marksheet">Semester Marksheet</option>
              <option value="Certificate">Course / Professional Certificate</option>
              <option value="Transfer Certificate">Transfer Certificate</option>
              <option value="Community Certificate">Community Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Upload File (PDF, PNG, JPG) <span class="required">*</span></label>
            <div class="file-upload-zone" onclick="document.getElementById('fileUploadInput').click()">
              <div class="file-upload-icon">${getIcon('upload')}</div>
              <div class="file-upload-text">Click or drag & drop certificate here</div>
              <div class="file-upload-subtext">Maximum file size 10MB</div>
              <input type="file" id="fileUploadInput" name="file" style="display: none;" onchange="this.previousElementSibling.textContent = this.files[0]?.name || 'File selected'" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${getIcon('upload')} Upload Document</button>
        </div>
      </form>
    `);
  },

  submitDocUpload(e) {
    e.preventDefault();
    const form = e.target;
    const docData = {
      id: Date.now(),
      title: form.title.value,
      document_type: form.document_type.value,
      status: 'PENDING',
      uploaded_at: new Date().toISOString().split('T')[0],
      reviewer_comments: 'Submitted for HOD verification.'
    };

    this.mockData.documents.unshift(docData);
    App.closeModal();
    App.showToast('Document uploaded successfully for verification!', 'success');
    if (App.currentView === 'student-documents') {
      this.renderDocuments(document.getElementById('mainContent'));
    }
  },

  openSubmitAssignmentModal(id, title) {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Submit Assignment: ${title}</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form onsubmit="StudentModule.submitAssignmentFile(event, ${id})">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Student Submission Notes / GitHub Link</label>
            <textarea class="form-control" name="notes" placeholder="Enter submission remarks, code link or brief summary..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Solution Document / Code Zip <span class="required">*</span></label>
            <div class="file-upload-zone" onclick="document.getElementById('assignFileInput').click()">
              <div class="file-upload-icon">${getIcon('upload')}</div>
              <div class="file-upload-text">Choose file to upload</div>
              <input type="file" id="assignFileInput" name="file" style="display: none;" onchange="this.previousElementSibling.textContent = this.files[0]?.name || 'File selected'" required />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${getIcon('send')} Finalize Submission</button>
        </div>
      </form>
    `);
  },

  submitAssignmentFile(e, id) {
    e.preventDefault();
    const item = this.mockData.assignments.find(a => a.id === id);
    if (item) {
      item.status = 'SUBMITTED';
      item.submitted_at = new Date().toISOString().split('T')[0];
    }
    App.closeModal();
    App.showToast('Assignment submitted successfully!', 'success');
    if (App.currentView === 'student-assignments') {
      this.renderAssignments(document.getElementById('mainContent'));
    }
  },

  openEditProfileModal() {
    let student = Auth.currentUser?.student_profile || this.mockData.profile;
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Update Contact & Profile Information</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form onsubmit="StudentModule.saveProfileUpdates(event)">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" class="form-control" name="phone" value="${student.phone || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Residential Address</label>
            <textarea class="form-control" name="address" required>${student.address || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Profile Changes</button>
        </div>
      </form>
    `);
  },

  saveProfileUpdates(e) {
    e.preventDefault();
    const form = e.target;
    this.mockData.profile.phone = form.phone.value;
    this.mockData.profile.address = form.address.value;
    App.closeModal();
    App.showToast('Profile contact information updated successfully!', 'success');
    if (App.currentView === 'student-profile') {
      this.renderProfile(document.getElementById('mainContent'));
    }
  }
};
