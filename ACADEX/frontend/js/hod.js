/**
 * ACADEX HOD Module Controller
 * Complete Department Academic Management Dashboard
 */

const HODModule = {
  mockData: {
    overview: {
      total_students: 248,
      department: 'Department of Information Technology',
      avg_attendance: 86.4,
      pending_leaves: 3,
      pending_documents: 4,
      active_assignments: 6
    },
    students: [
      { id: 1, name: 'Alex Johnson', reg_no: '25IT104', year: 3, section: 'B', attendance: 88.3, email: 'alex.j@acadex.edu', phone: '+91 98765 43210', status: 'Active' },
      { id: 2, name: 'Priya Sharma', reg_no: '25IT105', year: 3, section: 'B', attendance: 94.2, email: 'priya.s@acadex.edu', phone: '+91 98765 43211', status: 'Active' },
      { id: 3, name: 'Rahul Varma', reg_no: '25IT106', year: 3, section: 'A', attendance: 68.5, email: 'rahul.v@acadex.edu', phone: '+91 98765 43212', status: 'Low Attendance' },
      { id: 4, name: 'Sneha Patel', reg_no: '25IT107', year: 2, section: 'A', attendance: 91.0, email: 'sneha.p@acadex.edu', phone: '+91 98765 43213', status: 'Active' },
      { id: 5, name: 'Karthik Raja', reg_no: '25IT108', year: 4, section: 'B', attendance: 72.0, email: 'karthik.r@acadex.edu', phone: '+91 98765 43214', status: 'Low Attendance' },
      { id: 6, name: 'Divya Nair', reg_no: '25IT109', year: 3, section: 'B', attendance: 96.5, email: 'divya.n@acadex.edu', phone: '+91 98765 43215', status: 'Active' }
    ],
    leaves: [
      { id: 101, student_name: 'Alex Johnson', reg_no: '25IT104', leave_type: 'On Duty (OD)', reason: 'Smart India Hackathon zonal round presentation', from_date: '2026-11-24', to_date: '2026-11-25', status: 'PENDING' },
      { id: 102, student_name: 'Rahul Varma', reg_no: '25IT106', leave_type: 'Medical Leave', reason: 'Dengue recovery hospitalized for 3 days', from_date: '2026-11-18', to_date: '2026-11-20', status: 'PENDING' },
      { id: 103, student_name: 'Sneha Patel', reg_no: '25IT107', leave_type: 'Casual Leave', reason: 'Sister wedding in hometown', from_date: '2026-11-22', to_date: '2026-11-23', status: 'PENDING' }
    ],
    submissions: [
      { id: 201, assignment_id: 1, assignment_title: 'DBMS ER-Diagram & Normalization Project', student_name: 'Alex Johnson', reg_no: '25IT104', submitted_at: '2026-11-14', status: 'SUBMITTED', score: null },
      { id: 202, assignment_id: 1, assignment_title: 'DBMS ER-Diagram & Normalization Project', student_name: 'Priya Sharma', reg_no: '25IT105', submitted_at: '2026-11-13', status: 'GRADED', score: 49, feedback: 'Flawless normalization schema.' },
      { id: 203, assignment_id: 2, assignment_title: 'Responsive Dashboard Design in React/HTML5', student_name: 'Divya Nair', reg_no: '25IT109', submitted_at: '2026-11-14', status: 'GRADED', score: 48, feedback: 'Great CSS styling.' }
    ],
    auditLogs: [
      { action: 'Approved Student Leave', user: 'HOD - Dr. R. Ramanathan', time: 'Today at 02:30 PM', description: 'Approved OD for Alex Johnson (25IT104)' },
      { action: 'Published Announcement', user: 'HOD - Dr. R. Ramanathan', time: 'Yesterday at 11:15 AM', description: 'Mid-Semester Exam Schedule published to all students' },
      { action: 'Graded Assignment Submission', user: 'HOD - Dr. R. Ramanathan', time: '2 days ago', description: 'Graded Priya Sharma (25IT105) for DBMS Project' }
    ]
  },

  // 1. HOD Overview Dashboard
  renderOverview(container) {
    let ov = this.mockData.overview;
    let leaves = this.mockData.leaves;
    let lowAtt = this.mockData.students.filter(s => s.attendance < 75);

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Head of Department Academic Portal</h1>
          <p>${ov.department} • Executive Control & Monitoring</p>
        </div>
        <div class="page-actions-box">
          <button class="btn btn-secondary" onclick="HODModule.openCreateAnnouncementModal()">
            ${getIcon('bell')} Publish Notice
          </button>
          <button class="btn btn-primary" onclick="HODModule.openCreateAssignmentModal()">
            ${getIcon('plus')} New Assignment
          </button>
        </div>
      </div>

      <!-- KPI Stat Grid -->
      <div class="stats-grid">
        <div class="stat-card variant-info">
          <div class="stat-content">
            <span class="stat-label">Total Department Students</span>
            <div class="stat-value">${ov.total_students}</div>
            <span class="stat-subtext">${getIcon('users')} Across Year 1 to 4</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('users')}</div>
        </div>

        <div class="stat-card variant-success">
          <div class="stat-content">
            <span class="stat-label">Average Attendance</span>
            <div class="stat-value">${ov.avg_attendance}%</div>
            <span class="stat-subtext">${getIcon('checkCircle')} Healthy department rate</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('checkCircle')}</div>
        </div>

        <div class="stat-card variant-warning">
          <div class="stat-content">
            <span class="stat-label">Pending Leave Requests</span>
            <div class="stat-value">${leaves.filter(l => l.status === 'PENDING').length}</div>
            <span class="stat-subtext">${getIcon('clock')} Requires HOD action</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('clock')}</div>
        </div>

        <div class="stat-card variant-danger">
          <div class="stat-content">
            <span class="stat-label">Attendance Warning</span>
            <div class="stat-value">${lowAtt.length}</div>
            <span class="stat-subtext">${getIcon('alertCircle')} Students below 75%</span>
          </div>
          <div class="stat-icon-wrapper">${getIcon('alertCircle')}</div>
        </div>
      </div>

      <!-- Quick Action Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- Leave Requests Queue -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('clock')} Urgent Leave & OD Approvals</div>
            <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('hod-leaves')">View All</button>
          </div>
          <div class="card-body" style="padding: 1rem 1.5rem;">
            ${leaves.filter(l => l.status === 'PENDING').length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No pending leave requests.</div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.875rem;">
                ${leaves.filter(l => l.status === 'PENDING').slice(0, 3).map(l => `
                  <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.875rem; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div style="font-weight: 600; font-size: 0.9rem;">${l.student_name} <small style="color: var(--text-muted);">(${l.reg_no})</small></div>
                      <div style="font-size: 0.75rem; color: var(--accent-indigo); font-weight: 600;">${l.leave_type} • ${l.from_date} to ${l.to_date}</div>
                      <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">${l.reason}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                      <button class="btn btn-success btn-sm" onclick="HODModule.quickApproveLeave(${l.id})">Approve</button>
                      <button class="btn btn-danger btn-sm" onclick="HODModule.openRejectLeaveModal(${l.id})">Reject</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Attendance Watchlist (< 75%) -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('alertCircle')} Attendance Warning List (< 75%)</div>
            <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('hod-attendance')">Manage</button>
          </div>
          <div class="card-body" style="padding: 1rem 1.5rem;">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${lowAtt.map(s => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 0.875rem; background: var(--danger-bg); border: 1px solid var(--danger-border); border-radius: var(--radius-md);">
                  <div>
                    <div style="font-weight: 600; font-size: 0.875rem; color: var(--danger);">${s.name} (${s.reg_no})</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Year ${s.year} - Sec ${s.section} • Phone: ${s.phone}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.125rem; font-weight: 800; color: var(--danger);">${s.attendance}%</div>
                    <div style="font-size: 0.7rem; color: var(--danger);">Critical Shortage</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>

      <!-- Department Modules Navigation Grid -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">${getIcon('building')} Department Academic Management Tools</div>
        </div>
        <div class="card-body" style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick="App.navigateTo('hod-students')">${getIcon('users')} Student Directory</button>
          <button class="btn btn-secondary" onclick="App.navigateTo('hod-attendance')">${getIcon('checkCircle')} Mark Attendance</button>
          <button class="btn btn-secondary" onclick="App.navigateTo('hod-timetable')">${getIcon('calendar')} Manage Timetable</button>
          <button class="btn btn-secondary" onclick="App.navigateTo('hod-assignments')">${getIcon('fileText')} Review Submissions</button>
          <button class="btn btn-secondary" onclick="App.navigateTo('hod-materials')">${getIcon('book')} Upload Materials</button>
          <button class="btn btn-secondary" onclick="App.navigateTo('hod-marks')">${getIcon('barChart')} Internal Marks</button>
          <button class="btn btn-secondary" onclick="App.navigateTo('hod-announcements')">${getIcon('bell')} Announcements</button>
        </div>
      </div>
    `;
  },

  // 2. Student Directory & Filtering View
  renderStudents(container) {
    let students = this.mockData.students;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Department Student Management</h1>
          <p>Search, filter and inspect academic records for all enrolled students</p>
        </div>
        <button class="btn btn-primary" onclick="HODModule.openAddStudentModal()">
          ${getIcon('plus')} Register New Student
        </button>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-body" style="padding: 1.25rem;">
          <div class="table-filter-bar" style="margin: 0;">
            <div class="search-input-box" style="flex: 1;">
              ${getIcon('search')}
              <input type="text" id="studentSearchInput" placeholder="Search by student name or register number..." onkeyup="HODModule.filterStudentTable()" />
            </div>
            <div class="filter-actions">
              <select class="select-custom" id="yearFilter" onchange="HODModule.filterStudentTable()">
                <option value="ALL">All Academic Years</option>
                <option value="2">Year 2 (Sophomore)</option>
                <option value="3">Year 3 (Junior)</option>
                <option value="4">Year 4 (Senior)</option>
              </select>
              <select class="select-custom" id="sectionFilter" onchange="HODModule.filterStudentTable()">
                <option value="ALL">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table" id="studentDirectoryTable">
          <thead>
            <tr>
              <th>Register No</th>
              <th>Student Name</th>
              <th>Academic Year & Sec</th>
              <th>Attendance Rate</th>
              <th>Email</th>
              <th>Contact Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr data-year="${s.year}" data-section="${s.section}">
                <td><strong>${s.reg_no}</strong></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.625rem;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">
                      ${s.name[0]}
                    </div>
                    <strong>${s.name}</strong>
                  </div>
                </td>
                <td>Year ${s.year} - Sec ${s.section}</td>
                <td>
                  <span style="font-weight: 700; color: ${s.attendance >= 75 ? 'var(--success)' : 'var(--danger)'};">
                    ${s.attendance}%
                  </span>
                </td>
                <td>${s.email}</td>
                <td>${s.phone}</td>
                <td>
                  <span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-danger'}">
                    <span class="badge-dot"></span> ${s.status}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="HODModule.viewStudentProfile(${s.id})">
                    ${getIcon('user')} Details
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  filterStudentTable() {
    const search = document.getElementById('studentSearchInput')?.value.toLowerCase() || '';
    const year = document.getElementById('yearFilter')?.value || 'ALL';
    const section = document.getElementById('sectionFilter')?.value || 'ALL';
    const rows = document.querySelectorAll('#studentDirectoryTable tbody tr');

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const rYear = row.getAttribute('data-year');
      const rSec = row.getAttribute('data-section');

      const matchesSearch = text.includes(search);
      const matchesYear = year === 'ALL' || rYear === year;
      const matchesSec = section === 'ALL' || rSec === section;

      row.style.display = (matchesSearch && matchesYear && matchesSec) ? '' : 'none';
    });
  },

  viewStudentProfile(id) {
    const s = this.mockData.students.find(item => item.id === id);
    if (!s) return;

    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Student Profile: ${s.name} (${s.reg_no})</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <div class="modal-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div><label class="form-label" style="color: var(--text-muted);">Register Number</label><div style="font-weight: 600;">${s.reg_no}</div></div>
          <div><label class="form-label" style="color: var(--text-muted);">Student Name</label><div style="font-weight: 600;">${s.name}</div></div>
          <div><label class="form-label" style="color: var(--text-muted);">Department & Year</label><div style="font-weight: 600;">IT • Year ${s.year} - Section ${s.section}</div></div>
          <div><label class="form-label" style="color: var(--text-muted);">Cumulative Attendance</label><div style="font-weight: 700; color: ${s.attendance >= 75 ? 'var(--success)' : 'var(--danger)'};">${s.attendance}%</div></div>
          <div><label class="form-label" style="color: var(--text-muted);">Email Address</label><div style="font-weight: 600;">${s.email}</div></div>
          <div><label class="form-label" style="color: var(--text-muted);">Phone Number</label><div style="font-weight: 600;">${s.phone}</div></div>
        </div>
        <div class="card" style="background: var(--bg-surface-alt); padding: 1rem;">
          <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Academic Remarks & Advising</h4>
          <p style="font-size: 0.8125rem; color: var(--text-muted);">
            ${s.attendance >= 75 ? 'Student is in good academic standing. Eligible for semester exams.' : 'WARNING: Student has attendance shortage below 75%. Parent consultation recommended.'}
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="App.closeModal()">Close</button>
      </div>
    `);
  },

  // 3. Attendance Management View
  renderAttendanceManagement(container) {
    let students = this.mockData.students.filter(s => s.year === 3);

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Department Attendance Management</h1>
          <p>Record daily period attendance and monitor class compliance</p>
        </div>
        <div class="page-actions-box">
          <button class="btn btn-secondary" onclick="HODModule.markAllPresent()">
            ${getIcon('checkCircle')} Mark All Present
          </button>
          <button class="btn btn-primary" onclick="HODModule.saveBatchAttendance()">
            ${getIcon('send')} Save Attendance Record
          </button>
        </div>
      </div>

      <!-- Selection Filter Controls -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <label class="form-label">Subject Course</label>
              <select class="form-control" id="attSubjectSelect">
                <option value="IT601">IT601 - Database Management Systems</option>
                <option value="IT602">IT602 - Web Technology & Cloud</option>
                <option value="IT603">IT603 - Design & Analysis of Algorithms</option>
                <option value="IT604">IT604 - Computer Networks</option>
              </select>
            </div>
            <div>
              <label class="form-label">Academic Year & Section</label>
              <select class="form-control">
                <option>Year 3 - Section B</option>
                <option>Year 3 - Section A</option>
                <option>Year 2 - Section A</option>
              </select>
            </div>
            <div>
              <label class="form-label">Session Date</label>
              <input type="date" class="form-control" value="2026-11-15" />
            </div>
            <div>
              <label class="form-label">Period</label>
              <select class="form-control">
                <option>Period 1 & 2 (09:00 - 10:40 AM)</option>
                <option>Period 3 & 4 (11:00 - 12:40 PM)</option>
                <option>Period 5 & 6 (01:30 - 03:10 PM)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Attendance Check Table -->
      <div class="table-responsive">
        <table class="data-table" id="batchAttendanceTable">
          <thead>
            <tr>
              <th>Register No</th>
              <th>Student Name</th>
              <th>Current Rate</th>
              <th>Attendance Status Today</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td><strong>${s.reg_no}</strong></td>
                <td><strong>${s.name}</strong></td>
                <td><span style="font-weight: 600; color: ${s.attendance >= 75 ? 'var(--success)' : 'var(--danger)'};">${s.attendance}%</span></td>
                <td>
                  <div style="display: flex; gap: 0.5rem;" class="status-toggle-group">
                    <button type="button" class="btn btn-sm btn-success att-btn active" onclick="HODModule.setAttStatus(this, 'PRESENT')">Present</button>
                    <button type="button" class="btn btn-sm btn-secondary att-btn" onclick="HODModule.setAttStatus(this, 'ABSENT')">Absent</button>
                    <button type="button" class="btn btn-sm btn-secondary att-btn" onclick="HODModule.setAttStatus(this, 'OD')">On Duty (OD)</button>
                    <button type="button" class="btn btn-sm btn-secondary att-btn" onclick="HODModule.setAttStatus(this, 'LATE')">Late</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  setAttStatus(btn, status) {
    const parent = btn.closest('.status-toggle-group');
    parent.querySelectorAll('.att-btn').forEach(b => {
      b.className = 'btn btn-sm btn-secondary att-btn';
    });
    if (status === 'PRESENT') btn.className = 'btn btn-sm btn-success att-btn active';
    else if (status === 'ABSENT') btn.className = 'btn btn-sm btn-danger att-btn active';
    else if (status === 'OD') btn.className = 'btn btn-sm btn-primary att-btn active';
    else btn.className = 'btn btn-sm btn-secondary att-btn active';
  },

  markAllPresent() {
    document.querySelectorAll('#batchAttendanceTable .status-toggle-group').forEach(group => {
      group.querySelectorAll('.att-btn').forEach((b, idx) => {
        b.className = idx === 0 ? 'btn btn-sm btn-success att-btn active' : 'btn btn-sm btn-secondary att-btn';
      });
    });
    App.showToast('All students marked Present', 'info');
  },

  saveBatchAttendance() {
    App.showToast('Batch attendance recorded and synchronized with database!', 'success');
  },

  // 4. Timetable Management View
  renderTimetableManagement(container) {
    let timetable = StudentModule.mockData.timetable;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Department Master Timetable</h1>
          <p>Organize weekly faculty schedules, subject allocation and lecture halls</p>
        </div>
        <button class="btn btn-primary" onclick="HODModule.openEditSlotModal()">
          ${getIcon('plus')} Add / Modify Class Slot
        </button>
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

  // 5. Announcements Management View
  renderAnnouncementsManagement(container) {
    let announcements = StudentModule.mockData.announcements;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Announcements & Campus Circulars</h1>
          <p>Publish targeted notifications to specific years, sections or the entire college</p>
        </div>
        <button class="btn btn-primary" onclick="HODModule.openCreateAnnouncementModal()">
          ${getIcon('plus')} Create New Announcement
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${announcements.map(a => `
          <div class="card">
            <div class="card-header">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="badge ${a.priority === 'URGENT' ? 'badge-danger' : a.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-neutral'}">${a.priority}</span>
                <span class="badge badge-info">Audience: ${a.audience}</span>
                <h3 style="font-size: 1.05rem; font-weight: 700;">${a.title}</h3>
              </div>
              <button class="btn btn-danger btn-sm" onclick="HODModule.deleteAnnouncement(${a.id})">
                ${getIcon('trash')} Delete
              </button>
            </div>
            <div class="card-body">
              <p style="font-size: 0.9375rem; color: var(--text-main); line-height: 1.6;">${a.message}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 6. Assignments & Submissions Review View
  renderAssignmentsManagement(container) {
    let subs = this.mockData.submissions;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Course Assignments & Submission Review</h1>
          <p>Manage assignment briefs, evaluate student submissions and publish marks</p>
        </div>
        <button class="btn btn-primary" onclick="HODModule.openCreateAssignmentModal()">
          ${getIcon('plus')} Create Assignment
        </button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Assignment Title</th>
              <th>Student</th>
              <th>Submission Date</th>
              <th>Grading Status</th>
              <th>Score Awarded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${subs.map(sub => `
              <tr>
                <td><strong>${sub.assignment_title}</strong></td>
                <td>${sub.student_name} <small style="color: var(--text-muted);">(${sub.reg_no})</small></td>
                <td>${sub.submitted_at}</td>
                <td>
                  <span class="badge ${sub.status === 'GRADED' ? 'badge-success' : 'badge-warning'}">
                    <span class="badge-dot"></span> ${sub.status}
                  </span>
                </td>
                <td><strong>${sub.score !== null ? `${sub.score} / 50` : 'Not Graded'}</strong></td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="HODModule.openGradeSubmissionModal(${sub.id})">
                    ${getIcon('edit')} Evaluate & Grade
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 7. Study Materials Management View
  renderMaterialsManagement(container) {
    let mats = StudentModule.mockData.materials;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Department Study Materials</h1>
          <p>Upload lecture notes, syllabi and reference materials for students</p>
        </div>
        <button class="btn btn-primary" onclick="HODModule.openUploadMaterialModal()">
          ${getIcon('upload')} Upload New Material
        </button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Document Title</th>
              <th>Course Subject</th>
              <th>Uploaded Faculty</th>
              <th>File Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${mats.map(m => `
              <tr>
                <td><strong>${m.title}</strong></td>
                <td><span class="badge badge-info">${m.subject}</span></td>
                <td>${m.teacher}</td>
                <td>${m.file_size}</td>
                <td>
                  <button class="btn btn-danger btn-sm" onclick="App.showToast('Material removed', 'info')">
                    ${getIcon('trash')} Remove
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 8. Leave Approvals View
  renderLeaveApprovals(container) {
    let leaves = this.mockData.leaves;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Student Leave & OD Approvals</h1>
          <p>Review leave requests, reason documentation and grant departmental approval</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Register No</th>
              <th>Leave Type</th>
              <th>From - To</th>
              <th>Reason</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            ${leaves.map(l => `
              <tr>
                <td><strong>${l.student_name}</strong></td>
                <td>${l.reg_no}</td>
                <td><span class="badge badge-info">${l.leave_type}</span></td>
                <td>${l.from_date} to ${l.to_date}</td>
                <td>${l.reason}</td>
                <td>
                  ${l.status === 'PENDING' ? `
                    <div style="display: flex; gap: 0.5rem;">
                      <button class="btn btn-success btn-sm" onclick="HODModule.quickApproveLeave(${l.id})">Approve</button>
                      <button class="btn btn-danger btn-sm" onclick="HODModule.openRejectLeaveModal(${l.id})">Reject</button>
                    </div>
                  ` : `
                    <span class="badge ${l.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}">${l.status}</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 9. Internal Marks Management View
  renderMarksManagement(container) {
    let students = this.mockData.students;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Internal Marks Management</h1>
          <p>Continuous Assessment Test results entry and performance recording</p>
        </div>
        <button class="btn btn-primary" onclick="App.showToast('Marks synchronized and recorded!', 'success')">
          ${getIcon('send')} Save All Marks
        </button>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <label class="form-label">Subject</label>
              <select class="form-control">
                <option>Database Management Systems (IT601)</option>
                <option>Web Technology & Cloud (IT602)</option>
                <option>Computer Networks (IT604)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Assessment Exam</label>
              <select class="form-control">
                <option>Continuous Assessment Test 1 (Max: 50)</option>
                <option>Continuous Assessment Test 2 (Max: 50)</option>
                <option>Model Examination (Max: 100)</option>
                <option>Assignment Component (Max: 10)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Register No</th>
              <th>Student Name</th>
              <th>Year & Sec</th>
              <th>Marks Obtained (Max: 50)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td><strong>${s.reg_no}</strong></td>
                <td><strong>${s.name}</strong></td>
                <td>Year ${s.year} - Sec ${s.section}</td>
                <td style="width: 160px;">
                  <input type="number" class="form-control" value="${Math.floor(s.attendance / 2)}" min="0" max="50" />
                </td>
                <td>
                  <input type="text" class="form-control" placeholder="Good performance" />
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // Modal Handlers
  openCreateAnnouncementModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Create Campus Announcement</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form onsubmit="HODModule.saveAnnouncement(event)">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Announcement Title <span class="required">*</span></label>
            <input type="text" class="form-control" name="title" placeholder="e.g. Mid-Term Examination Timetable" required />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Target Audience</label>
              <select class="form-control" name="audience">
                <option value="ALL">All Students</option>
                <option value="DEPARTMENT">Department Only</option>
                <option value="YEAR">Specific Year</option>
                <option value="SECTION">Specific Section</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Priority Level</label>
              <select class="form-control" name="priority">
                <option value="NORMAL">Normal Priority</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent Alert</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Message Content <span class="required">*</span></label>
            <textarea class="form-control" name="message" placeholder="Provide complete notice details here..." required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${getIcon('send')} Publish Announcement</button>
        </div>
      </form>
    `);
  },

  saveAnnouncement(e) {
    e.preventDefault();
    const form = e.target;
    const a = {
      id: Date.now(),
      title: form.title.value,
      message: form.message.value,
      priority: form.priority.value,
      audience: form.audience.value,
      created_at: new Date().toISOString().split('T')[0],
      author: 'HOD - Dr. R. Ramanathan'
    };
    StudentModule.mockData.announcements.unshift(a);
    App.closeModal();
    App.showToast('Announcement published successfully to student portal!', 'success');
    if (App.currentView === 'hod-announcements') {
      this.renderAnnouncementsManagement(document.getElementById('mainContent'));
    }
  },

  deleteAnnouncement(id) {
    StudentModule.mockData.announcements = StudentModule.mockData.announcements.filter(a => a.id !== id);
    App.showToast('Announcement deleted', 'info');
    if (App.currentView === 'hod-announcements') {
      this.renderAnnouncementsManagement(document.getElementById('mainContent'));
    }
  },

  openCreateAssignmentModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Create New Assignment Brief</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form onsubmit="HODModule.saveAssignment(event)">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Assignment Title <span class="required">*</span></label>
            <input type="text" class="form-control" name="title" placeholder="e.g. Relational Normalization & SQL Queries" required />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Subject</label>
              <select class="form-control" name="subject">
                <option value="Database Management Systems">Database Management Systems</option>
                <option value="Web Technology & Cloud">Web Technology & Cloud</option>
                <option value="Design & Analysis of Algorithms">Design & Analysis of Algorithms</option>
                <option value="Computer Networks">Computer Networks</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Due Date <span class="required">*</span></label>
              <input type="date" class="form-control" name="due_date" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Maximum Points / Score</label>
            <input type="number" class="form-control" name="max_score" value="50" />
          </div>
          <div class="form-group">
            <label class="form-label">Description & Problem Statement</label>
            <textarea class="form-control" name="description" placeholder="Specify instructions, rubric and submission requirements..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${getIcon('plus')} Create Assignment</button>
        </div>
      </form>
    `);
  },

  saveAssignment(e) {
    e.preventDefault();
    const form = e.target;
    const a = {
      id: Date.now(),
      title: form.title.value,
      subject: form.subject.value,
      due_date: form.due_date.value,
      max_score: parseInt(form.max_score.value, 10),
      description: form.description.value,
      status: 'PENDING'
    };
    StudentModule.mockData.assignments.unshift(a);
    App.closeModal();
    App.showToast('Assignment created and published to class!', 'success');
  },

  quickApproveLeave(id) {
    const leave = this.mockData.leaves.find(l => l.id === id);
    if (leave) {
      leave.status = 'APPROVED';
      App.showToast(`Leave application for ${leave.student_name} approved!`, 'success');
      if (App.currentView === 'hod-overview') this.renderOverview(document.getElementById('mainContent'));
      if (App.currentView === 'hod-leaves') this.renderLeaveApprovals(document.getElementById('mainContent'));
    }
  },

  openRejectLeaveModal(id) {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Reject Leave Application</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form onsubmit="HODModule.confirmRejectLeave(event, ${id})">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Reason for Rejection <span class="required">*</span></label>
            <textarea class="form-control" name="remarks" placeholder="Specify feedback for student (e.g. Low attendance, insufficient documentation)..." required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-danger">Confirm Rejection</button>
        </div>
      </form>
    `);
  },

  confirmRejectLeave(e, id) {
    e.preventDefault();
    const leave = this.mockData.leaves.find(l => l.id === id);
    if (leave) {
      leave.status = 'REJECTED';
      leave.hod_comments = e.target.remarks.value;
      App.closeModal();
      App.showToast('Leave request rejected.', 'info');
      if (App.currentView === 'hod-overview') this.renderOverview(document.getElementById('mainContent'));
      if (App.currentView === 'hod-leaves') this.renderLeaveApprovals(document.getElementById('mainContent'));
    }
  },

  openGradeSubmissionModal(id) {
    const sub = this.mockData.submissions.find(s => s.id === id);
    if (!sub) return;

    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Evaluate Submission: ${sub.student_name}</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form onsubmit="HODModule.saveGrade(event, ${id})">
        <div class="modal-body">
          <div style="margin-bottom: 1rem;">
            <div><strong>Task:</strong> ${sub.assignment_title}</div>
            <div><strong>Student Reg No:</strong> ${sub.reg_no}</div>
            <div><strong>Submitted:</strong> ${sub.submitted_at}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Score Awarded (out of 50) <span class="required">*</span></label>
            <input type="number" class="form-control" name="score" min="0" max="50" value="${sub.score || 45}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Faculty Feedback</label>
            <textarea class="form-control" name="feedback" placeholder="Enter constructive evaluation feedback...">${sub.feedback || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${getIcon('checkCircle')} Save & Publish Grade</button>
        </div>
      </form>
    `);
  },

  saveGrade(e, id) {
    e.preventDefault();
    const sub = this.mockData.submissions.find(s => s.id === id);
    if (sub) {
      sub.score = parseInt(e.target.score.value, 10);
      sub.feedback = e.target.feedback.value;
      sub.status = 'GRADED';
      App.closeModal();
      App.showToast(`Grade recorded for ${sub.student_name}: ${sub.score}/50`, 'success');
      if (App.currentView === 'hod-assignments') {
        this.renderAssignmentsManagement(document.getElementById('mainContent'));
      }
    }
  },

  openAddStudentModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Register New Student to Department</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form onsubmit="HODModule.saveNewStudent(event)">
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Register Number <span class="required">*</span></label>
              <input type="text" class="form-control" name="reg_no" placeholder="e.g. 25IT110" required />
            </div>
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input type="text" class="form-control" name="name" placeholder="Student name" required />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Academic Year</label>
              <select class="form-control" name="year">
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3" selected>Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Section</label>
              <select class="form-control" name="section">
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input type="email" class="form-control" name="email" placeholder="student@acadex.edu" required />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number <span class="required">*</span></label>
              <input type="text" class="form-control" name="phone" placeholder="+91 98765 00000" required />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${getIcon('plus')} Register Student</button>
        </div>
      </form>
    `);
  },

  saveNewStudent(e) {
    e.preventDefault();
    const form = e.target;
    const s = {
      id: Date.now(),
      name: form.name.value,
      reg_no: form.reg_no.value,
      year: parseInt(form.year.value, 10),
      section: form.section.value,
      attendance: 100.0,
      email: form.email.value,
      phone: form.phone.value,
      status: 'Active'
    };
    this.mockData.students.unshift(s);
    App.closeModal();
    App.showToast(`Student ${s.name} (${s.reg_no}) registered successfully!`, 'success');
    if (App.currentView === 'hod-students') {
      this.renderStudents(document.getElementById('mainContent'));
    }
  },

  openUploadMaterialModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Upload Course Study Material</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form onsubmit="HODModule.saveMaterial(event)">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Material / Notes Title <span class="required">*</span></label>
            <input type="text" class="form-control" name="title" placeholder="e.g. Unit 4: Cloud Virtualization & Containers" required />
          </div>
          <div class="form-group">
            <label class="form-label">Subject</label>
            <select class="form-control" name="subject">
              <option value="Database Management Systems">Database Management Systems</option>
              <option value="Web Technology & Cloud">Web Technology & Cloud</option>
              <option value="Design & Analysis of Algorithms">Design & Analysis of Algorithms</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Lecture Notes File (PDF / DOCX)</label>
            <div class="file-upload-zone" onclick="document.getElementById('matFileInput').click()">
              <div class="file-upload-icon">${getIcon('upload')}</div>
              <div class="file-upload-text">Select course notes file</div>
              <input type="file" id="matFileInput" name="file" style="display: none;" onchange="this.previousElementSibling.textContent = this.files[0]?.name || 'File selected'" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${getIcon('upload')} Publish Material</button>
        </div>
      </form>
    `);
  },

  saveMaterial(e) {
    e.preventDefault();
    const form = e.target;
    const m = {
      id: Date.now(),
      title: form.title.value,
      subject: form.subject.value,
      teacher: 'Dr. R. Ramanathan, HOD',
      file_size: '4.2 MB',
      updated_at: new Date().toISOString().split('T')[0]
    };
    StudentModule.mockData.materials.unshift(m);
    App.closeModal();
    App.showToast('Study material published to department repository!', 'success');
    if (App.currentView === 'hod-materials') {
      this.renderMaterialsManagement(document.getElementById('mainContent'));
    }
  }
};
