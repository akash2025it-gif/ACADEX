/**
 * ACADEX — Head of Department (HOD) Command Center Controller
 * Department-scoped executive management, analytics, approvals, and coursework oversight.
 */

const HODModule = {
  esc(v = '') {
    if (v === null || v === undefined) return '';
    const e = document.createElement('span');
    e.textContent = String(v);
    return e.innerHTML;
  },

  empty(title, text) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${getIcon('folder')}</div>
        <h3>${this.esc(title)}</h3>
        <p>${this.esc(text)}</p>
      </div>
    `;
  },

  async load(container, apiFn, renderFn) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" style="animation: spin 1s linear infinite;">${getIcon('clock')}</div>
        <h3>Loading department records…</h3>
        <p>Connecting securely to ACADEX PostgreSQL backend</p>
      </div>
    `;
    try {
      const data = await apiFn();
      renderFn(data);
    } catch (err) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color: var(--danger);">${getIcon('alertCircle')}</div>
          <h3>Unable to load department records</h3>
          <p>${this.esc(err.message || 'Error occurred while contacting API.')}</p>
          <button class="btn btn-primary" onclick="App.route()" style="margin-top: 1rem;">
            ${getIcon('refresh')} Retry
          </button>
        </div>
      `;
    }
  },

  department() {
    return Auth.currentUser?.hod_profile?.department || 'Information Technology';
  },

  /* -------------------------------------------------------------
     1. DEPARTMENT OVERVIEW & EXECUTIVE ANALYTICS
     ------------------------------------------------------------- */
  renderOverview(c) {
    this.load(c, () => Promise.all([
      API.department.getOverview(),
      API.leaves.list(),
      API.attendance.getDepartmentAnalytics(),
      API.assignments.list()
    ]), ([overview, leaves, analytics, assignments]) => {
      const dept = this.department();
      const avgRate = parseFloat(overview.avg_attendance || analytics.department_average || 0).toFixed(1);
      const pendingLeaves = (leaves || []).filter(l => l.status === 'PENDING');
      const watchlist = analytics.watchlist || [];

      c.innerHTML = `
        <!-- Executive Banner -->
        <div class="page-header-row" style="background: #ffffff; border: 1px solid var(--border-light); padding: 1.5rem; border-radius: var(--radius-xl); margin-bottom: 1.5rem; box-shadow: 0 4px 20px -2px rgba(15,23,42,0.03);">
          <div class="page-title-box">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span class="status-badge badge-info">DEPARTMENT OF ${this.esc(dept.toUpperCase())}</span>
              <span class="status-badge badge-success">Live Analytics</span>
            </div>
            <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--primary-navy); margin: 0 0 0.25rem;">
              Department Executive Command Center
            </h1>
            <p style="color: var(--text-muted); margin: 0; font-size: 0.875rem;">
              Head of Department: ${this.esc(Auth.currentUser?.first_name || 'Dr.')} ${this.esc(Auth.currentUser?.last_name || '')} (${this.esc(Auth.currentUser?.hod_profile?.employee_id || 'HOD-IT')})
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="HODModule.openCreateAnnouncementModal()">
              ${getIcon('bell')} Publish Notice
            </button>
            <button class="btn btn-primary btn-sm" onclick="HODModule.openCreateAssignmentModal()">
              ${getIcon('plus')} New Assignment
            </button>
          </div>
        </div>

        <!-- 4 Key Stat Cards -->
        <div class="stats-grid" style="margin-bottom: 1.5rem;">
          <div class="stat-card variant-info">
            <div class="stat-content">
              <span class="stat-label">Enrolled Students</span>
              <div class="stat-value">${overview.total_students || 15}</div>
              <span class="stat-subtext">Active student records in department</span>
            </div>
          </div>

          <div class="stat-card variant-success">
            <div class="stat-content">
              <span class="stat-label">Average Attendance</span>
              <div class="stat-value" style="color: var(--success);">${avgRate}%</div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill success" style="width: ${Math.min(avgRate, 100)}%;"></div>
              </div>
              <span class="stat-subtext">Department-wide class presence</span>
            </div>
          </div>

          <div class="stat-card variant-warning">
            <div class="stat-content">
              <span class="stat-label">Pending Leave Requests</span>
              <div class="stat-value" style="color: var(--warning);">${pendingLeaves.length}</div>
              <span class="stat-subtext">Applications awaiting HOD decision</span>
            </div>
          </div>

          <div class="stat-card variant-danger">
            <div class="stat-content">
              <span class="stat-label">Low Attendance Alerts</span>
              <div class="stat-value" style="color: var(--danger);">${overview.low_attendance_count || watchlist.length || 0}</div>
              <span class="stat-subtext">Students under mandatory 75%</span>
            </div>
          </div>
        </div>

        <!-- Grid: Low Attendance Watchlist + Pending Leave Approvals -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
          <!-- Low Attendance Watchlist -->
          <div class="card" style="border-top: 4px solid var(--danger);">
            <div class="card-header">
              <div class="card-title" style="color: var(--danger);">
                ${getIcon('alertCircle')} Attendance Shortage Watchlist (&lt; 75%)
              </div>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('hod-attendance')">Monitor</button>
            </div>
            <div class="card-body" style="padding: 0;">
              ${watchlist.length ? `
                <div class="table-responsive">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Student Name & Reg No</th>
                        <th>Year</th>
                        <th>Attendance</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${watchlist.map(w => `
                        <tr>
                          <td>
                            <strong>${this.esc(w.name)}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(w.reg_no)}</div>
                          </td>
                          <td>Year ${w.year || 3}</td>
                          <td>
                            <strong style="color: var(--danger);">${parseFloat(w.attendance || 0).toFixed(1)}%</strong>
                          </td>
                          <td style="font-size: 0.8125rem;">${this.esc(w.phone || '—')}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
                  All department students currently meet the 75% attendance threshold.
                </div>
              `}
            </div>
          </div>

          <!-- Pending Leave Applications -->
          <div class="card" style="border-top: 4px solid var(--warning);">
            <div class="card-header">
              <div class="card-title">
                ${getIcon('clock')} Pending Leave & OD Approvals (${pendingLeaves.length})
              </div>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('hod-leaves')">View All</button>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${pendingLeaves.slice(0, 3).map(l => `
                <div style="padding: 0.875rem; background: var(--bg-surface-alt); border-radius: var(--radius-md); border-left: 3px solid var(--warning);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
                    <div>
                      <strong style="font-size: 0.875rem; color: var(--text-main);">${this.esc(l.student_name)}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">(${this.esc(l.student_reg)})</span>
                    </div>
                    <span class="status-badge badge-warning">${this.esc(l.leave_type)}</span>
                  </div>
                  <p style="font-size: 0.8125rem; color: var(--text-muted); margin: 0 0 0.5rem; line-height: 1.4;">
                    "${this.esc(l.reason)}"
                  </p>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
                    <span style="color: var(--text-muted);">${this.esc(l.from_date)} to ${this.esc(l.to_date)}</span>
                    <div style="display: flex; gap: 0.35rem;">
                      <button class="btn btn-success btn-sm" onclick="HODModule.reviewLeave(${l.id}, 'APPROVED')">
                        Approve
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="HODModule.reviewLeave(${l.id}, 'REJECTED')">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              `).join('') || '<p style="color: var(--text-muted); font-size: 0.875rem;">No pending leave applications requiring approval.</p>'}
            </div>
          </div>
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     2. STUDENT DIRECTORY & DOSSIER
     ------------------------------------------------------------- */
  renderStudents(c) {
    this.load(c, () => API.department.getStudents(), (students) => {
      let filtered = [...students];

      const renderTable = (list) => {
        const tbody = document.getElementById('studentTableBody');
        const countSpan = document.getElementById('studentCountBadge');
        if (countSpan) countSpan.textContent = `${list.length} Students`;
        if (!tbody) return;

        tbody.innerHTML = list.map(s => {
          const rate = parseFloat(s.attendance || 0).toFixed(1);
          const ok = rate >= 75;
          return `
            <tr>
              <td>
                <span class="status-badge badge-info">${this.esc(s.reg_no)}</span>
              </td>
              <td>
                <strong>${this.esc(s.name)}</strong>
              </td>
              <td>Year ${s.year || 3} (Sec ${this.esc(s.section || 'B')})</td>
              <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <strong style="color: ${ok ? 'var(--success)' : 'var(--danger)'};">${rate}%</strong>
                  <div class="progress-bar-track" style="width: 60px; margin: 0;">
                    <div class="progress-bar-fill ${ok ? 'success' : 'danger'}" style="width: ${Math.min(rate, 100)}%;"></div>
                  </div>
                </div>
              </td>
              <td style="font-size: 0.8125rem;">${this.esc(s.email)}</td>
              <td style="font-size: 0.8125rem;">${this.esc(s.phone || '—')}</td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="HODModule.openStudent(${s.id})">
                  ${getIcon('user')} View Dossier
                </button>
              </td>
            </tr>
          `;
        }).join('') || '<tr><td colspan="7" style="text-align: center;">No matching student records found.</td></tr>';
      };

      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Department Student Directory</h1>
            <p>Official student profiles registered in Department of ${this.esc(this.department())}.</p>
          </div>
          <span class="status-badge badge-info" id="studentCountBadge" style="font-size: 0.875rem;">
            ${students.length} Students
          </span>
        </div>

        <div class="card" style="margin-bottom: 1.25rem;">
          <div class="card-body" style="padding: 1rem;">
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <input type="text" class="form-control" id="studentSearchInput" placeholder="Search by name or register number..." style="flex: 2; min-width: 220px;" />
              <select class="form-control" id="yearFilterSelect" style="flex: 1; min-width: 130px;">
                <option value="">All Academic Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3" selected>Year 3</option>
                <option value="4">Year 4</option>
              </select>
              <select class="form-control" id="sectionFilterSelect" style="flex: 1; min-width: 120px;">
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Register Number</th>
                  <th>Student Full Name</th>
                  <th>Class / Section</th>
                  <th>Attendance %</th>
                  <th>Official Email</th>
                  <th>Phone Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="studentTableBody"></tbody>
            </table>
          </div>
        </div>
      `;

      renderTable(filtered);

      const filterFn = () => {
        const query = document.getElementById('studentSearchInput')?.value.trim().toLowerCase() || '';
        const yr = document.getElementById('yearFilterSelect')?.value || '';
        const sec = document.getElementById('sectionFilterSelect')?.value || '';

        const results = students.filter(s => {
          const matchQuery = !query || s.name.toLowerCase().includes(query) || s.reg_no.toLowerCase().includes(query);
          const matchYear = !yr || String(s.year) === yr;
          const matchSec = !sec || s.section === sec;
          return matchQuery && matchYear && matchSec;
        });
        renderTable(results);
      };

      document.getElementById('studentSearchInput')?.addEventListener('input', filterFn);
      document.getElementById('yearFilterSelect')?.addEventListener('change', filterFn);
      document.getElementById('sectionFilterSelect')?.addEventListener('change', filterFn);
    });
  },

  /* -------------------------------------------------------------
     3. ATTENDANCE MONITOR & BATCH MARKING
     ------------------------------------------------------------- */
  renderAttendanceManagement(c) {
    this.load(c, () => Promise.all([
      API.department.getStudents(),
      API.attendance.getDepartmentAnalytics()
    ]), ([students, analytics]) => {
      const todayStr = new Date().toISOString().slice(0, 10);

      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Attendance Management & Class Registers</h1>
            <p>Mark daily session attendance for students and monitor departmental thresholds.</p>
          </div>
        </div>

        <!-- Attendance Marking Form -->
        <form class="card" onsubmit="HODModule.saveBatchAttendance(event)" style="margin-bottom: 2rem;">
          <div class="card-header">
            <div class="card-title">${getIcon('edit')} Record Session Attendance Batch</div>
          </div>
          <div class="card-body">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
              <div class="form-group">
                <label class="form-label">Subject Code <span class="required">*</span></label>
                <input class="form-control" name="subject_code" value="IT3501" required />
              </div>
              <div class="form-group">
                <label class="form-label">Subject Title <span class="required">*</span></label>
                <input class="form-control" name="subject_name" value="Full Stack Web Development" required />
              </div>
              <div class="form-group">
                <label class="form-label">Session Date <span class="required">*</span></label>
                <input class="form-control" type="date" name="date" value="${todayStr}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Lecture Period <span class="required">*</span></label>
                <input class="form-control" name="period" value="Period 1" required />
              </div>
            </div>

            <div class="table-responsive" style="margin-bottom: 1.5rem;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Register Number</th>
                    <th>Student Name</th>
                    <th>Current Rate</th>
                    <th style="width: 200px;">Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(s => `
                    <tr>
                      <td><span class="status-badge badge-info">${this.esc(s.reg_no)}</span></td>
                      <td><strong>${this.esc(s.name)}</strong></td>
                      <td>${parseFloat(s.attendance || 0).toFixed(1)}%</td>
                      <td>
                        <select class="form-control batch-att-select" data-student="${s.id}" style="padding: 0.35rem 0.6rem; font-size: 0.8125rem;">
                          <option value="PRESENT" selected>Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="OD">On Duty (OD)</option>
                          <option value="LATE">Late</option>
                          <option value="MEDICAL">Medical Leave</option>
                        </select>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
              ${getIcon('checkCircle')} Commit Attendance Register to Database
            </button>
          </div>
        </form>
      `;
    });
  },

  async saveBatchAttendance(e) {
    e.preventDefault();
    const form = e.target;
    const subject_code = form.subject_code.value.trim();
    const subject_name = form.subject_name.value.trim();
    const date = form.date.value;
    const period = form.period.value.trim();

    const selects = form.querySelectorAll('.batch-att-select');
    const records = Array.from(selects).map(s => ({
      student: Number(s.dataset.student),
      status: s.value
    }));

    try {
      await API.attendance.markAttendance({
        subject_code,
        subject_name,
        date,
        period,
        records
      });
      App.showToast(`Recorded attendance for ${records.length} students successfully.`, 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to record attendance batch.', 'error');
    }
  },

  /* -------------------------------------------------------------
     4. TIMETABLE CONTROL
     ------------------------------------------------------------- */
  renderTimetableManagement(c) {
    this.load(c, () => API.timetable.get(), (slots) => {
      const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
      const dayNames = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday' };

      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Department Timetable Schedule</h1>
            <p>Manage weekly timetable slots, room allotments, and faculty assignments.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="HODModule.openTimetableSlotModal()">
            ${getIcon('plus')} Add Timetable Slot
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${days.map(d => {
            const daySlots = (slots || []).filter(s => s.day === d).sort((a, b) => a.period_number - b.period_number);
            return `
              <div class="card">
                <div class="card-header" style="background: var(--bg-surface-alt); padding: 0.75rem 1.25rem;">
                  <strong style="color: var(--primary-navy);">${dayNames[d]}</strong>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${daySlots.length} Periods</span>
                </div>
                <div class="table-responsive">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th style="width: 80px;">Period</th>
                        <th style="width: 140px;">Timing</th>
                        <th>Subject</th>
                        <th>Class Section</th>
                        <th>Faculty</th>
                        <th>Room</th>
                        <th style="width: 80px;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${daySlots.map(s => `
                        <tr>
                          <td><span class="status-badge badge-info">P${s.period_number}</span></td>
                          <td style="font-size: 0.8125rem; font-weight: 600;">${this.esc(s.start_time?.slice(0, 5))} - ${this.esc(s.end_time?.slice(0, 5))}</td>
                          <td>
                            <strong>${this.esc(s.subject_name)}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(s.subject_code)}</div>
                          </td>
                          <td>Year ${s.year} (Sec ${this.esc(s.section)})</td>
                          <td style="font-size: 0.8125rem;">${this.esc(s.faculty_name || 'Faculty Assigned')}</td>
                          <td><span class="status-badge badge-neutral">${this.esc(s.room || 'TBA')}</span></td>
                          <td>
                            <button class="btn btn-danger btn-sm" onclick="HODModule.deleteTimetableSlot(${s.id})">
                              ${getIcon('trash')}
                            </button>
                          </td>
                        </tr>
                      `).join('') || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No slots scheduled for this day.</td></tr>'}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    });
  },

  openTimetableSlotModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Add Timetable Slot</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="HODModule.saveTimetableSlot(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Day of Week <span class="required">*</span></label>
            <select class="form-control" name="day" required>
              <option value="MON">Monday</option>
              <option value="TUE">Tuesday</option>
              <option value="WED">Wednesday</option>
              <option value="THU">Thursday</option>
              <option value="FRI">Friday</option>
              <option value="SAT">Saturday</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Period Number (1-8) <span class="required">*</span></label>
            <input class="form-control" type="number" min="1" max="8" name="period_number" value="1" required />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Start Time <span class="required">*</span></label>
            <input class="form-control" type="time" name="start_time" value="09:00" required />
          </div>
          <div class="form-group">
            <label class="form-label">End Time <span class="required">*</span></label>
            <input class="form-control" type="time" name="end_time" value="09:50" required />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Subject Code <span class="required">*</span></label>
            <input class="form-control" name="subject_code" placeholder="e.g. IT3501" required />
          </div>
          <div class="form-group">
            <label class="form-label">Subject Name <span class="required">*</span></label>
            <input class="form-control" name="subject_name" placeholder="Full Stack Web Development" required />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Year <span class="required">*</span></label>
            <select class="form-control" name="year">
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3" selected>Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section <span class="required">*</span></label>
            <input class="form-control" name="section" value="B" required />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Faculty Name</label>
            <input class="form-control" name="faculty_name" placeholder="Prof. Sridhar" />
          </div>
          <div class="form-group">
            <label class="form-label">Room / Lab</label>
            <input class="form-control" name="room" placeholder="Lab 3" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Save Timetable Slot</button>
      </form>
    `);
  },

  async saveTimetableSlot(e) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.period_number = Number(data.period_number);
      data.year = Number(data.year);
      data.department = this.department();
      await API.timetable.save(data);
      App.closeModal();
      App.showToast('Timetable slot added.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to save timetable slot.', 'error');
    }
  },

  async deleteTimetableSlot(id) {
    if (!confirm('Are you sure you want to remove this timetable slot?')) return;
    try {
      await API.delete(`/timetable/${id}/`);
      App.showToast('Slot removed.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to delete slot.', 'error');
    }
  },

  /* -------------------------------------------------------------
     5. LEAVE & OD APPROVALS
     ------------------------------------------------------------- */
  renderLeaveApprovals(c) {
    this.load(c, () => API.leaves.list(), (leaves) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Leave & On-Duty (OD) Approvals</h1>
            <p>Review student applications for medical leaves, hackathons, and symposiums.</p>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th style="width: 160px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${(leaves || []).map(l => {
                  let badge = 'badge-warning';
                  if (l.status === 'APPROVED') badge = 'badge-success';
                  else if (l.status === 'REJECTED') badge = 'badge-danger';

                  return `
                    <tr>
                      <td>
                        <strong>${this.esc(l.student_name)}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(l.student_reg)}</div>
                      </td>
                      <td><strong>${this.esc(l.leave_type)}</strong></td>
                      <td style="font-size: 0.8125rem;">${this.esc(l.from_date)} to ${this.esc(l.to_date)}</td>
                      <td style="font-size: 0.8125rem; max-width: 220px;">${this.esc(l.reason)}</td>
                      <td><span class="status-badge ${badge}">${this.esc(l.status)}</span></td>
                      <td style="font-size: 0.8125rem; color: var(--text-muted); font-style: italic;">
                        ${this.esc(l.hod_comments || '—')}
                      </td>
                      <td>
                        ${l.status === 'PENDING' ? `
                          <div style="display: flex; gap: 0.35rem;">
                            <button class="btn btn-success btn-sm" onclick="HODModule.reviewLeavePrompt(${l.id}, 'APPROVED')">
                              Approve
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="HODModule.reviewLeavePrompt(${l.id}, 'REJECTED')">
                              Reject
                            </button>
                          </div>
                        ` : `
                          <button class="btn btn-secondary btn-sm" onclick="HODModule.reviewLeavePrompt(${l.id}, '${l.status}')">
                            Update
                          </button>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="7" style="text-align: center;">No leave applications found.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
  },

  reviewLeavePrompt(id, defaultStatus) {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Review Leave Application</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="HODModule.submitLeaveReview(event, ${id})" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Decision Status <span class="required">*</span></label>
          <select class="form-control" name="status" required>
            <option value="APPROVED" ${defaultStatus === 'APPROVED' ? 'selected' : ''}>Approve Application</option>
            <option value="REJECTED" ${defaultStatus === 'REJECTED' ? 'selected' : ''}>Reject Application</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">HOD Comments / Instructions</label>
          <textarea class="form-control" name="comments" rows="3" placeholder="Enter remarks or approval conditions for student"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Save Decision</button>
      </form>
    `);
  },

  async submitLeaveReview(e, id) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      await API.leaves.review(id, {
        status: data.status,
        comments: data.comments.trim()
      });
      App.closeModal();
      App.showToast(`Application ${data.status.toLowerCase()} successfully.`, 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Review failed.', 'error');
    }
  },

  async reviewLeave(id, status) {
    try {
      await API.leaves.review(id, {
        status,
        comments: status === 'APPROVED' ? 'Approved by HOD' : 'Declined per departmental policies.'
      });
      App.showToast(`Application ${status.toLowerCase()}.`, 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Review failed.', 'error');
    }
  },

  /* -------------------------------------------------------------
     6. ASSIGNMENTS & GRADING
     ------------------------------------------------------------- */
  renderAssignmentsManagement(c) {
    this.load(c, () => API.assignments.list(), (items) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Assignments & Coursework Grading</h1>
            <p>Publish assignments, inspect student code submissions, and record marks.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="HODModule.openCreateAssignmentModal()">
            ${getIcon('plus')} Create Assignment
          </button>
        </div>

        <div style="display: grid; gap: 1.25rem;">
          ${(items || []).map(a => `
            <div class="card">
              <div class="card-body" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                  <div>
                    <span style="font-size: 0.75rem; color: var(--accent-indigo); font-weight: 700;">
                      ${this.esc(a.subject_name)} (${this.esc(a.subject_code || '')})
                    </span>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-navy); margin: 0.25rem 0;">
                      ${this.esc(a.title)}
                    </h3>
                  </div>
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-sm" onclick="HODModule.openSubmissions(${a.id}, '${this.esc(a.title)}')">
                      ${getIcon('fileText')} Submissions
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="HODModule.deleteAssignment(${a.id})">
                      ${getIcon('trash')}
                    </button>
                  </div>
                </div>

                <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
                  ${this.esc(a.description)}
                </p>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 0.75rem; font-size: 0.8125rem; color: var(--text-muted);">
                  <span>Target: Year ${a.year || 3} ${a.section ? `(Sec ${this.esc(a.section)})` : ''}</span>
                  <span>Due Date: <strong style="color: var(--text-main);">${this.esc(a.due_date)}</strong> · Max Score: <strong>${a.max_score}</strong></span>
                </div>
              </div>
            </div>
          `).join('') || this.empty('No assignments', 'No assignments created yet. Click "Create Assignment" to post coursework.')}
        </div>
      `;
    });
  },

  openCreateAssignmentModal() {
    const today = new Date();
    today.setDate(today.getDate() + 10);
    const defaultDue = today.toISOString().slice(0, 10);

    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Create New Assignment</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="HODModule.saveAssignment(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Assignment Title <span class="required">*</span></label>
          <input class="form-control" name="title" placeholder="e.g. Full-Stack REST API & Database Normalization" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Subject Code</label>
            <input class="form-control" name="subject_code" value="IT3501" />
          </div>
          <div class="form-group">
            <label class="form-label">Subject Title <span class="required">*</span></label>
            <input class="form-control" name="subject_name" value="Full Stack Web Development" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Detailed Brief & Requirements <span class="required">*</span></label>
          <textarea class="form-control" name="description" rows="3" placeholder="Provide problem statement, rubrics, and deliverable format" required></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Due Date <span class="required">*</span></label>
            <input class="form-control" type="date" name="due_date" value="${defaultDue}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Max Score <span class="required">*</span></label>
            <input class="form-control" type="number" name="max_score" value="50" required />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Target Year <span class="required">*</span></label>
            <select class="form-control" name="year">
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3" selected>Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section (Leave blank for all)</label>
            <input class="form-control" name="section" placeholder="e.g. B" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Publish Assignment</button>
      </form>
    `);
  },

  async saveAssignment(e) {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      fd.append('department', this.department());
      await API.assignments.create(fd);
      App.closeModal();
      App.showToast('Assignment published to students.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to create assignment.', 'error');
    }
  },

  async deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await API.assignments.delete(id);
      App.showToast('Assignment removed.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to delete assignment.', 'error');
    }
  },

  async openSubmissions(id, title) {
    App.openModal('<div class="modal-body">Loading submissions…</div>');
    try {
      const subs = await API.assignments.getSubmissions(id);
      App.openModal(`
        <div class="modal-header">
          <h3 class="modal-title">Submissions: ${this.esc(title)}</h3>
          <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
        </div>
        <div class="modal-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Notes / Solution</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${subs.map(s => `
                  <tr>
                    <td>
                      <strong>${this.esc(s.student_name)}</strong>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(s.student_reg)}</div>
                    </td>
                    <td style="font-size: 0.8125rem; max-width: 250px;">
                      ${this.esc(s.notes || 'No text notes attached')}
                    </td>
                    <td><span class="status-badge ${s.status === 'GRADED' ? 'badge-success' : 'badge-info'}">${this.esc(s.status)}</span></td>
                    <td><strong>${s.score !== null ? s.score : '—'}</strong></td>
                    <td>
                      <button class="btn btn-primary btn-sm" onclick="HODModule.openGradeModal(${s.id}, '${this.esc(s.student_name)}')">
                        Grade
                      </button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">No submissions yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `);
    } catch (err) {
      App.openModal(`<div class="modal-body"><h3>Failed to load submissions</h3><p>${err.message}</p></div>`);
    }
  },

  openGradeModal(submissionId, studentName) {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Grade Submission: ${this.esc(studentName)}</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="HODModule.submitGrade(event, ${submissionId})" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Score Awarded <span class="required">*</span></label>
          <input class="form-control" type="number" name="score" min="0" max="100" placeholder="e.g. 48" required />
        </div>
        <div class="form-group">
          <label class="form-label">Faculty Feedback & Rubric Notes</label>
          <textarea class="form-control" name="feedback" rows="3" placeholder="Excellent implementation with modular architecture."></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Commit Grade</button>
      </form>
    `);
  },

  async submitGrade(e, submissionId) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.score = Number(data.score);
      await API.assignments.gradeSubmission(submissionId, data);
      App.closeModal();
      App.showToast('Grade and feedback saved successfully.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to grade submission.', 'error');
    }
  },

  /* -------------------------------------------------------------
     7. COURSE MATERIALS
     ------------------------------------------------------------- */
  renderMaterialsManagement(c) {
    this.load(c, () => API.materials.list(), (items) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Department Course Materials</h1>
            <p>Upload official lecture notes, lab guides, and reference material for students.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="HODModule.openUploadMaterialModal()">
            ${getIcon('upload')} Upload Course Material
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          ${(items || []).map(m => `
            <div class="card">
              <div class="card-body" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span class="status-badge badge-info">${this.esc(m.subject_code || 'IT')}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(m.file_size || 'PDF')}</span>
                  </div>
                  <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.25rem;">
                    ${this.esc(m.title)}
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--accent-indigo); font-weight: 600; margin-bottom: 0.5rem;">
                    ${this.esc(m.subject_name)}
                  </div>
                  <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1rem;">
                    ${this.esc(m.description)}
                  </p>
                </div>
                <div style="border-top: 1px solid var(--border-light); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.6875rem; color: var(--text-subtle);">Year ${m.year || 3}</span>
                  <button class="btn btn-danger btn-sm" onclick="HODModule.deleteMaterial(${m.id})">
                    ${getIcon('trash')} Remove
                  </button>
                </div>
              </div>
            </div>
          `).join('') || this.empty('No materials', 'No course materials uploaded yet.')}
        </div>
      `;
    });
  },

  openUploadMaterialModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Upload Course Material</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="HODModule.saveMaterial(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Material Title <span class="required">*</span></label>
          <input class="form-control" name="title" placeholder="e.g. Unit 3: Cloud Native Infrastructure & Kubernetes" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Subject Code</label>
            <input class="form-control" name="subject_code" value="IT3503" />
          </div>
          <div class="form-group">
            <label class="form-label">Subject Title <span class="required">*</span></label>
            <input class="form-control" name="subject_name" value="Computer Networks & Cloud Computing" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description & Unit Coverage <span class="required">*</span></label>
          <textarea class="form-control" name="description" rows="2" placeholder="Brief outline of syllabus covered in this document" required></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Year <span class="required">*</span></label>
            <select class="form-control" name="year">
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3" selected>Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section (optional)</label>
            <input class="form-control" name="section" placeholder="e.g. B" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Select File (PDF, DOCX, etc.) <span class="required">*</span></label>
          <input class="form-control" type="file" name="file" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Upload Resource</button>
      </form>
    `);
  },

  async saveMaterial(e) {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      fd.append('department', this.department());
      await API.materials.upload(fd);
      App.closeModal();
      App.showToast('Course material uploaded.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to upload material.', 'error');
    }
  },

  async deleteMaterial(id) {
    if (!confirm('Are you sure you want to delete this study material?')) return;
    try {
      await API.materials.delete(id);
      App.showToast('Material removed.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to delete material.', 'error');
    }
  },

  /* -------------------------------------------------------------
     8. DOCUMENT VERIFICATION
     ------------------------------------------------------------- */
  renderDocumentVerification(c) {
    this.load(c, () => API.documents.list(), (docs) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Student Document Verification</h1>
            <p>Inspect student identity cards, marksheets, and official certificates.</p>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>Current Status</th>
                  <th>Review Remarks</th>
                  <th style="width: 160px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${(docs || []).map(d => {
                  let badge = 'badge-neutral';
                  if (d.status === 'APPROVED') badge = 'badge-success';
                  else if (d.status === 'REJECTED') badge = 'badge-danger';
                  else if (d.status === 'PENDING') badge = 'badge-warning';

                  return `
                    <tr>
                      <td>
                        <strong>${this.esc(d.student_name)}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(d.student_reg)}</div>
                      </td>
                      <td><strong>${this.esc(d.title)}</strong></td>
                      <td><span class="status-badge badge-info">${this.esc(d.document_type)}</span></td>
                      <td><span class="status-badge ${badge}">${this.esc(d.status)}</span></td>
                      <td style="font-size: 0.8125rem; color: var(--text-muted); font-style: italic;">
                        ${this.esc(d.reviewer_comments || '—')}
                      </td>
                      <td>
                        <button class="btn btn-primary btn-sm" onclick="HODModule.openReviewDocumentModal(${d.id}, '${this.esc(d.title)}')">
                          Verify
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="6" style="text-align: center;">No documents pending verification.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
  },

  openReviewDocumentModal(docId, title) {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Verify Document: ${this.esc(title)}</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="HODModule.submitDocReview(event, ${docId})" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Verification Status <span class="required">*</span></label>
          <select class="form-control" name="status" required>
            <option value="APPROVED" selected>Approved (Verified & Certified)</option>
            <option value="CORRECTION">Correction Required (Resubmit)</option>
            <option value="REJECTED">Rejected (Invalid Document)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Reviewer Comments</label>
          <textarea class="form-control" name="comments" rows="3" placeholder="Verified by HOD Office. Academic identity confirmed."></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Save Verification Record</button>
      </form>
    `);
  },

  async submitDocReview(e, docId) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      await API.documents.review(docId, data);
      App.closeModal();
      App.showToast(`Document marked as ${data.status.toLowerCase()}.`, 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Verification failed.', 'error');
    }
  },

  /* -------------------------------------------------------------
     9. MARKS MANAGEMENT
     ------------------------------------------------------------- */
  renderMarksManagement(c) {
    this.load(c, () => API.marks.getDepartmentMarks(), (marks) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Internal Marks Management</h1>
            <p>Publish CAT 1, CAT 2, and Model Examination scores for department students.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="HODModule.openMarkModal()">
            ${getIcon('plus')} Record Internal Mark
          </button>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Score Secured</th>
                  <th>Max Score</th>
                  <th>Percentage</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                ${(marks || []).map(m => {
                  const score = parseFloat(m.score || 0);
                  const max = parseFloat(m.max_score || 50);
                  const pct = ((score / max) * 100).toFixed(1);

                  return `
                    <tr>
                      <td>
                        <strong>${this.esc(m.student_name)}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(m.student_reg)}</div>
                      </td>
                      <td>
                        <strong>${this.esc(m.subject_name)}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(m.subject_code)}</div>
                      </td>
                      <td><span class="status-badge badge-info">${this.esc(m.exam_type)}</span></td>
                      <td><strong style="color: var(--primary-navy);">${score}</strong></td>
                      <td>${max}</td>
                      <td><strong>${pct}%</strong></td>
                      <td>Sem ${m.semester || 5}</td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="7" style="text-align: center;">No internal marks recorded yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
  },

  async openMarkModal() {
    try {
      const students = await API.department.getStudents();
      App.openModal(`
        <div class="modal-header">
          <h3 class="modal-title">Record Continuous Assessment Mark</h3>
          <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
        </div>
        <form class="modal-body" onsubmit="HODModule.saveMark(event)" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Select Student <span class="required">*</span></label>
            <select class="form-control" name="student" required>
              ${students.map(s => `<option value="${s.id}">${this.esc(s.reg_no)} — ${this.esc(s.name)} (Yr ${s.year})</option>`).join('')}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Subject Code <span class="required">*</span></label>
              <input class="form-control" name="subject_code" value="IT3501" required />
            </div>
            <div class="form-group">
              <label class="form-label">Subject Name <span class="required">*</span></label>
              <input class="form-control" name="subject_name" value="Full Stack Web Development" required />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Assessment Type <span class="required">*</span></label>
              <select class="form-control" name="exam_type" required>
                <option value="CAT1">CAT 1 (Mid Semester 1)</option>
                <option value="CAT2">CAT 2 (Mid Semester 2)</option>
                <option value="MODEL">Model Examination</option>
                <option value="ASSIGNMENT">Assignment Component</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Semester <span class="required">*</span></label>
              <input class="form-control" type="number" name="semester" value="5" min="1" max="8" required />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Score Secured <span class="required">*</span></label>
              <input class="form-control" type="number" step="0.5" name="score" placeholder="e.g. 46.5" required />
            </div>
            <div class="form-group">
              <label class="form-label">Maximum Score <span class="required">*</span></label>
              <input class="form-control" type="number" name="max_score" value="50" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Academic Year</label>
            <input class="form-control" name="academic_year" value="2026-27" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Commit Mark to Register</button>
        </form>
      `);
    } catch (err) {
      App.showToast(err.message || 'Failed to open modal.', 'error');
    }
  },

  async saveMark(e) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.student = Number(data.student);
      data.score = Number(data.score);
      data.max_score = Number(data.max_score);
      data.semester = Number(data.semester);
      await API.marks.saveMarks(data);
      App.closeModal();
      App.showToast('Internal mark saved.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to save mark.', 'error');
    }
  },

  /* -------------------------------------------------------------
     10. PUBLISH NOTICES & CIRCULARS
     ------------------------------------------------------------- */
  renderAnnouncementsManagement(c) {
    this.load(c, () => API.announcements.list(), (items) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Department Announcements & Notices</h1>
            <p>Publish official academic notices to department batches or individual sections.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="HODModule.openCreateAnnouncementModal()">
            ${getIcon('plus')} Publish New Notice
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${(items || []).map(a => `
            <div class="card" style="border-left: 4px solid ${a.priority === 'URGENT' ? 'var(--danger)' : a.priority === 'IMPORTANT' ? 'var(--warning)' : 'var(--accent-indigo)'};">
              <div class="card-body" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                  <div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-navy); margin: 0 0 0.25rem;">
                      ${this.esc(a.title)}
                    </h3>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <span class="status-badge ${a.priority === 'URGENT' ? 'badge-danger' : a.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-info'}">${this.esc(a.priority)}</span>
                      <span class="status-badge badge-neutral">Audience: ${this.esc(a.audience)}</span>
                      ${a.year ? `<span style="font-size: 0.75rem; color: var(--text-muted);">Year ${a.year}</span>` : ''}
                    </div>
                  </div>
                  <button class="btn btn-danger btn-sm" onclick="HODModule.deleteAnnouncement(${a.id})">
                    ${getIcon('trash')} Remove
                  </button>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.6; margin-bottom: 0.75rem;">
                  ${this.esc(a.message)}
                </p>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                  Published: ${this.esc(a.created_at?.slice(0, 10) || 'Recent')}
                </div>
              </div>
            </div>
          `).join('') || this.empty('No announcements', 'No announcements published yet.')}
        </div>
      `;
    });
  },

  openCreateAnnouncementModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Publish Department Notice</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="HODModule.saveAnnouncement(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Notice Headline <span class="required">*</span></label>
          <input class="form-control" name="title" placeholder="e.g. CAT 2 Examination Hall Allotment" required />
        </div>
        <div class="form-group">
          <label class="form-label">Notice Message <span class="required">*</span></label>
          <textarea class="form-control" name="message" rows="4" placeholder="Enter complete circular text..." required></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Target Audience <span class="required">*</span></label>
            <select class="form-control" name="audience" required>
              <option value="DEPARTMENT">Department Only</option>
              <option value="ALL">All Students</option>
              <option value="YEAR">Specific Year</option>
              <option value="SECTION">Specific Section</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority Level <span class="required">*</span></label>
            <select class="form-control" name="priority" required>
              <option value="NORMAL">Normal</option>
              <option value="IMPORTANT" selected>Important</option>
              <option value="URGENT">Urgent Alert</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Broadcast Circular</button>
      </form>
    `);
  },

  async saveAnnouncement(e) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.department = this.department();
      await API.announcements.create(data);
      App.closeModal();
      App.showToast('Circular published successfully.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to publish circular.', 'error');
    }
  },

  async deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to remove this notice?')) return;
    try {
      await API.announcements.delete(id);
      App.showToast('Notice removed.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to delete notice.', 'error');
    }
  },

  /* -------------------------------------------------------------
     STUDENT DOSSIER MODAL
     ------------------------------------------------------------- */
  async openStudent(studentId) {
    App.openModal('<div class="modal-body">Loading student academic dossier…</div>');
    try {
      const s = await API.department.getStudentDetail(studentId);
      const att = s.attendance_summary || {};
      const rate = parseFloat(att.percentage || att.overall_percentage || 0).toFixed(1);

      App.openModal(`
        <div class="modal-header">
          <h3 class="modal-title">Student Dossier: ${this.esc(s.full_name)}</h3>
          <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md);">
            <div>
              <span class="status-badge badge-info">${this.esc(s.register_number)}</span>
              <strong style="font-size: 1.15rem; color: var(--primary-navy); display: block; margin-top: 0.25rem;">
                ${this.esc(s.full_name)}
              </strong>
              <span style="font-size: 0.8125rem; color: var(--text-muted);">
                Department of ${this.esc(s.department)} · Year ${s.year} (Section ${this.esc(s.section)})
              </span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Attendance</span>
              <strong style="font-size: 1.25rem; color: ${rate >= 75 ? 'var(--success)' : 'var(--danger)'};">${rate}%</strong>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.8125rem;">
            <div>Email: <strong>${this.esc(s.email)}</strong></div>
            <div>Phone: <strong>${this.esc(s.phone || '—')}</strong></div>
            <div>Address: <strong>${this.esc(s.address || '—')}</strong></div>
            <div>DOB: <strong>${this.esc(s.date_of_birth || '—')}</strong></div>
          </div>

          <!-- Document status -->
          <div>
            <strong style="font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Verified Documents (${s.documents?.length || 0})</strong>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              ${(s.documents || []).map(d => `
                <div style="padding: 0.5rem 0.75rem; background: var(--bg-surface-alt); border-radius: var(--radius-sm); display: flex; justify-content: space-between; font-size: 0.8125rem;">
                  <span>${this.esc(d.title)} (${this.esc(d.document_type)})</span>
                  <span class="status-badge ${d.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}">${this.esc(d.status)}</span>
                </div>
              `).join('') || '<span style="font-size: 0.8125rem; color: var(--text-muted);">No documents recorded.</span>'}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="App.closeModal()">Close Dossier</button>
        </div>
      `);
    } catch (err) {
      App.openModal(`<div class="modal-body"><h3>Failed to load dossier</h3><p>${err.message}</p></div>`);
    }
  }
};
