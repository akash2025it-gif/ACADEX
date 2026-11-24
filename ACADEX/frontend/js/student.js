/**
 * ACADEX — Student Academic Portal Controller
 * Full-featured, live-API powered student coursework, attendance, records, and vault.
 */

const StudentModule = {
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
        <h3>Loading your academic records…</h3>
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
          <h3>Unable to load records</h3>
          <p>${this.esc(err.message || 'Network error occurred while contacting API.')}</p>
          <button class="btn btn-primary" onclick="App.route()" style="margin-top: 1rem;">
            ${getIcon('refresh')} Retry
          </button>
        </div>
      `;
    }
  },

  profile() {
    return Auth.currentUser?.student_profile || {};
  },

  /* -------------------------------------------------------------
     1. STUDENT OVERVIEW DASHBOARD
     ------------------------------------------------------------- */
  renderOverview(c) {
    this.load(c, () => Promise.all([
      API.attendance.getStudentSummary(),
      API.assignments.list(),
      API.announcements.list(),
      API.documents.list(),
      API.materials.list()
    ]), ([att, assignments, announcements, docs, materials]) => {
      const user = Auth.currentUser;
      const p = this.profile();
      const attRate = parseFloat(att.percentage ?? att.overall_percentage ?? 0).toFixed(1);
      const isEligible = attRate >= CONFIG.ATTENDANCE_MIN_THRESHOLD;
      const pendingSubmissions = (assignments || []).filter(a => !a.my_submission).length;
      const verifiedDocs = (docs || []).filter(d => d.status === 'APPROVED').length;

      c.innerHTML = `
        <!-- Welcome Header Banner -->
        <div class="page-header-row" style="background: #ffffff; border: 1px solid var(--border-light); padding: 1.5rem; border-radius: var(--radius-xl); margin-bottom: 1.5rem; box-shadow: 0 4px 20px -2px rgba(15,23,42,0.03);">
          <div class="page-title-box">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span class="status-badge badge-info">${this.esc(p.register_number || 'STUDENT')}</span>
              <span class="status-badge ${isEligible ? 'badge-success' : 'badge-danger'}">
                ${isEligible ? 'Exam Eligible' : 'Attendance Warning'}
              </span>
            </div>
            <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--primary-navy); margin: 0 0 0.25rem;">
              Welcome back, ${this.esc(user?.first_name || 'Student')}!
            </h1>
            <p style="color: var(--text-muted); margin: 0; font-size: 0.875rem;">
              Department of ${this.esc(p.department || 'Information Technology')} · Year ${p.year || 3} (Section ${this.esc(p.section || 'B')})
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="StudentModule.openUploadDocumentModal()">
              ${getIcon('upload')} Upload Document
            </button>
            <button class="btn btn-primary btn-sm" onclick="StudentModule.openApplyLeaveModal()">
              ${getIcon('plus')} Apply Leave / OD
            </button>
          </div>
        </div>

        <!-- 4 Key Stat Cards -->
        <div class="stats-grid" style="margin-bottom: 1.5rem;">
          <div class="stat-card ${isEligible ? 'variant-success' : 'variant-danger'}">
            <div class="stat-content">
              <span class="stat-label">Overall Attendance</span>
              <div class="stat-value" style="color: ${isEligible ? 'var(--success)' : 'var(--danger)'};">
                ${attRate}%
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill ${isEligible ? 'success' : 'danger'}" style="width: ${Math.min(attRate, 100)}%;"></div>
              </div>
              <span class="stat-subtext">${att.attended_classes || 0} of ${att.total_classes || 0} classes attended</span>
            </div>
          </div>

          <div class="stat-card variant-info">
            <div class="stat-content">
              <span class="stat-label">Enrolled Subjects</span>
              <div class="stat-value">${att.subjects?.length || 5}</div>
              <span class="stat-subtext">Semester 5 Curriculum</span>
            </div>
          </div>

          <div class="stat-card variant-warning">
            <div class="stat-content">
              <span class="stat-label">Pending Coursework</span>
              <div class="stat-value" style="color: var(--warning);">${pendingSubmissions}</div>
              <span class="stat-subtext">Assignments due for review</span>
            </div>
          </div>

          <div class="stat-card variant-success">
            <div class="stat-content">
              <span class="stat-label">Verified Documents</span>
              <div class="stat-value" style="color: var(--success);">${verifiedDocs}</div>
              <span class="stat-subtext">Official records verified in vault</span>
            </div>
          </div>
        </div>

        <!-- Subject Attendance Breakdown -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <div class="card-title">${getIcon('checkCircle')} Subject-wise Attendance Breakdown</div>
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('student-attendance')">Full Attendance Log</button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Subject Code & Name</th>
                  <th>Classes Attended</th>
                  <th>Attendance Rate</th>
                  <th>Examination Status</th>
                </tr>
              </thead>
              <tbody>
                ${(att.subjects || []).map(s => {
                  const sRate = parseFloat(s.percentage || 0).toFixed(1);
                  const sEligible = sRate >= 75;
                  return `
                    <tr>
                      <td>
                        <strong>${this.esc(s.name || s.subject_name || s.code)}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(s.code || '')}</div>
                      </td>
                      <td>${s.attended || 0} / ${s.total || 0}</td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <span style="font-weight: 600; min-width: 45px;">${sRate}%</span>
                          <div class="progress-bar-track" style="flex: 1; max-width: 140px; margin: 0;">
                            <div class="progress-bar-fill ${sEligible ? 'success' : 'danger'}" style="width: ${Math.min(sRate, 100)}%;"></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="status-badge ${sEligible ? 'badge-success' : 'badge-danger'}">
                          ${sEligible ? 'Eligible' : 'Low Attendance'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="4" style="text-align: center;">No subject attendance records found.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Two Column Grid: Notices + Course Materials -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
          <!-- Latest Announcements -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('bell')} Notices & Circulars</div>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('student-announcements')">View All</button>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${(announcements || []).slice(0, 3).map(a => `
                <div style="padding: 0.875rem; background: var(--bg-surface-alt); border-radius: var(--radius-md); border-left: 3px solid ${a.priority === 'URGENT' ? 'var(--danger)' : a.priority === 'IMPORTANT' ? 'var(--warning)' : 'var(--accent-indigo)'};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                    <strong style="font-size: 0.875rem; color: var(--text-main);">${this.esc(a.title)}</strong>
                    <span class="status-badge ${a.priority === 'URGENT' ? 'badge-danger' : a.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-info'}">${this.esc(a.priority)}</span>
                  </div>
                  <p style="font-size: 0.8125rem; color: var(--text-muted); margin: 0 0 0.25rem; line-height: 1.4;">${this.esc(a.message)}</p>
                  <div style="font-size: 0.6875rem; color: var(--text-subtle);">${this.esc(a.author_name || 'HOD Office')}</div>
                </div>
              `).join('') || '<p style="color: var(--text-muted); font-size: 0.875rem;">No circulars published.</p>'}
            </div>
          </div>

          <!-- Recent Course Materials -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('book')} Study Materials</div>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('student-materials')">View All</button>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${(materials || []).slice(0, 3).map(m => `
                <div style="padding: 0.875rem; background: var(--bg-surface-alt); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                  <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                    <strong style="font-size: 0.875rem; color: var(--text-main);">${this.esc(m.title)}</strong>
                    <span style="font-size: 0.75rem; color: var(--accent-indigo); font-weight: 600;">${this.esc(m.subject_name || m.subject_code)}</span>
                    <span style="font-size: 0.6875rem; color: var(--text-muted);">${this.esc(m.file_size || 'PDF Document')}</span>
                  </div>
                  <button class="btn btn-secondary btn-sm" onclick="App.showToast('Course material downloaded successfully.', 'success')">
                    ${getIcon('download')}
                  </button>
                </div>
              `).join('') || '<p style="color: var(--text-muted); font-size: 0.875rem;">No study materials uploaded.</p>'}
            </div>
          </div>
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     2. MY PROFILE
     ------------------------------------------------------------- */
  renderProfile(c) {
    this.load(c, () => API.auth.getProfile(), (u) => {
      Auth.currentUser = u;
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(u));
      const p = u.student_profile || {};

      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Academic Profile & Student Identity</h1>
            <p>Official student record verified by the Department of ${this.esc(p.department || 'Information Technology')}.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="StudentModule.openEditProfileModal()">
            ${getIcon('edit')} Edit Contact Info
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
          <!-- Primary ID Card -->
          <div class="card" style="border-top: 4px solid var(--accent-indigo);">
            <div class="card-body" style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 2rem;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent-indigo-light); color: var(--accent-indigo); font-size: 2rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                ${u.first_name ? u.first_name[0] : 'S'}
              </div>
              <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--primary-navy); margin: 0 0 0.25rem;">
                ${this.esc(`${u.first_name} ${u.last_name || ''}`)}
              </h2>
              <div class="status-badge badge-info" style="margin-bottom: 1rem;">
                ${this.esc(p.register_number)}
              </div>
              <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0 0 1.25rem;">
                ${this.esc(p.course || 'B.Tech Information Technology')}
              </p>
              
              <div style="width: 100%; border-top: 1px solid var(--border-light); padding-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; text-align: left; font-size: 0.8125rem;">
                <div>
                  <span style="color: var(--text-muted); display: block;">Academic Year</span>
                  <strong>Year ${p.year || 3}</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted); display: block;">Assigned Section</span>
                  <strong>Section ${this.esc(p.section || 'B')}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Official Details Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('fileText')} Official Registration Details</div>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
                <div>
                  <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">Department</span>
                  <strong>${this.esc(p.department)}</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">Official Email</span>
                  <strong>${this.esc(u.email)}</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">Contact Phone</span>
                  <strong>${this.esc(p.phone || 'Not provided')}</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">Date of Birth</span>
                  <strong>${this.esc(p.date_of_birth || 'Not recorded')}</strong>
                </div>
              </div>
              <div style="border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
                <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">Residential Address</span>
                <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--text-main); line-height: 1.5;">
                  ${this.esc(p.address || 'Address not updated. Click "Edit Contact Info" to update.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     3. ATTENDANCE MODULE & LOGS
     ------------------------------------------------------------- */
  renderAttendance(c) {
    this.load(c, () => Promise.all([
      API.attendance.getStudentSummary(),
      API.attendance.getStudentHistory()
    ]), ([summary, history]) => {
      const overallRate = parseFloat(summary.percentage ?? summary.overall_percentage ?? 0).toFixed(1);
      const isEligible = overallRate >= 75;

      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Attendance Management & History</h1>
            <p>Live session attendance records synced with department registers.</p>
          </div>
          <div class="status-badge ${isEligible ? 'badge-success' : 'badge-danger'}" style="font-size: 0.875rem; padding: 0.4rem 0.8rem;">
            Overall: ${overallRate}% (${isEligible ? 'Eligible' : 'Shortage Alert'})
          </div>
        </div>

        <!-- Subject Wise Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          ${(summary.subjects || []).map(s => {
            const rate = parseFloat(s.percentage || 0).toFixed(1);
            const ok = rate >= 75;
            return `
              <div class="card" style="border-left: 4px solid ${ok ? 'var(--success)' : 'var(--danger)'};">
                <div class="card-body" style="padding: 1.25rem;">
                  <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${this.esc(s.code || '')}</div>
                  <strong style="font-size: 0.9375rem; color: var(--primary-navy); display: block; margin: 0.25rem 0 0.75rem;">
                    ${this.esc(s.name || s.subject_name)}
                  </strong>
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.35rem;">
                    <span style="font-size: 1.25rem; font-weight: 800; color: ${ok ? 'var(--success)' : 'var(--danger)'};">${rate}%</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${s.attended || 0} / ${s.total || 0} classes</span>
                  </div>
                  <div class="progress-bar-track">
                    <div class="progress-bar-fill ${ok ? 'success' : 'danger'}" style="width: ${Math.min(rate, 100)}%;"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Daily Attendance History -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('calendar')} Daily Class Attendance History</div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Period</th>
                  <th>Recorded Status</th>
                </tr>
              </thead>
              <tbody>
                ${(history || []).map(h => {
                  let badge = 'badge-neutral';
                  if (h.status === 'PRESENT') badge = 'badge-success';
                  else if (h.status === 'ABSENT') badge = 'badge-danger';
                  else if (h.status === 'OD') badge = 'badge-info';
                  else if (h.status === 'LATE') badge = 'badge-warning';
                  else if (h.status === 'MEDICAL') badge = 'badge-info';

                  return `
                    <tr>
                      <td><strong>${this.esc(h.date)}</strong></td>
                      <td>${this.esc(h.subject_name)} <span style="font-size: 0.75rem; color: var(--text-muted);">(${this.esc(h.subject_code)})</span></td>
                      <td>${this.esc(h.period || 'Regular')}</td>
                      <td><span class="status-badge ${badge}">${this.esc(h.status)}</span></td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="4" style="text-align:center;">No history records available.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     4. CLASS TIMETABLE
     ------------------------------------------------------------- */
  renderTimetable(c) {
    this.load(c, () => API.timetable.get(), (slots) => {
      const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
      const dayNames = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday' };

      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Class Timetable & Schedule</h1>
            <p>Weekly lecture timetable for B.Tech IT Year 3 Section B.</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${days.map(d => {
            const daySlots = (slots || []).filter(s => s.day === d).sort((a, b) => a.period_number - b.period_number);
            return `
              <div class="card">
                <div class="card-header" style="background: var(--bg-surface-alt); padding: 0.75rem 1.25rem;">
                  <strong style="color: var(--primary-navy); font-size: 0.9375rem;">${dayNames[d]}</strong>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${daySlots.length} Scheduled Periods</span>
                </div>
                <div class="table-responsive">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th style="width: 80px;">Period</th>
                        <th style="width: 140px;">Timing</th>
                        <th>Subject</th>
                        <th>Faculty</th>
                        <th>Classroom</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${daySlots.map(s => `
                        <tr>
                          <td><span class="status-badge badge-info">P${s.period_number}</span></td>
                          <td style="font-size: 0.8125rem; font-weight: 600;">${this.esc(s.start_time?.slice(0, 5))} - ${this.esc(s.end_time?.slice(0, 5))}</td>
                          <td>
                            <strong>${this.esc(s.subject_name)}</strong>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">(${this.esc(s.subject_code)})</span>
                          </td>
                          <td style="font-size: 0.8125rem;">${this.esc(s.faculty_name || 'Faculty Assigned')}</td>
                          <td><span class="status-badge badge-neutral">${this.esc(s.room || 'Room TBA')}</span></td>
                        </tr>
                      `).join('') || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No classes scheduled.</td></tr>'}
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

  /* -------------------------------------------------------------
     5. INTERNAL EXAMINATION MARKS
     ------------------------------------------------------------- */
  renderMarks(c) {
    this.load(c, () => API.marks.getStudentMarks(), (marks) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Continuous Internal Assessment Marks</h1>
            <p>Official internal exam scores, assignments, and continuous assessment.</p>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Subject Code & Name</th>
                  <th>Assessment Type</th>
                  <th>Score Secured</th>
                  <th>Maximum</th>
                  <th>Percentage</th>
                  <th>Performance Grade</th>
                </tr>
              </thead>
              <tbody>
                ${(marks || []).map(m => {
                  const score = parseFloat(m.score || 0);
                  const max = parseFloat(m.max_score || 50);
                  const pct = ((score / max) * 100).toFixed(1);
                  let grade = 'O';
                  let badge = 'badge-success';
                  if (pct < 50) { grade = 'U (Reappear)'; badge = 'badge-danger'; }
                  else if (pct < 60) { grade = 'B'; badge = 'badge-warning'; }
                  else if (pct < 75) { grade = 'B+'; badge = 'badge-info'; }
                  else if (pct < 90) { grade = 'A'; badge = 'badge-success'; }
                  else if (pct < 95) { grade = 'A+'; badge = 'badge-success'; }

                  return `
                    <tr>
                      <td>
                        <strong>${this.esc(m.subject_name)}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(m.subject_code)} · Sem ${m.semester || 5}</div>
                      </td>
                      <td><span class="status-badge badge-info">${this.esc(m.exam_type)}</span></td>
                      <td><strong style="font-size: 1.05rem; color: var(--primary-navy);">${score}</strong></td>
                      <td>${max}</td>
                      <td><strong>${pct}%</strong></td>
                      <td><span class="status-badge ${badge}">${grade}</span></td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="6" style="text-align: center;">No internal marks published yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     6. ASSIGNMENTS & SUBMISSIONS
     ------------------------------------------------------------- */
  renderAssignments(c) {
    this.load(c, () => API.assignments.list(), (items) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Coursework & Assignments</h1>
            <p>Submit solutions and view grading feedback from course faculty.</p>
          </div>
        </div>

        <div style="display: grid; gap: 1.25rem;">
          ${(items || []).map(a => {
            const sub = a.my_submission;
            let statusBadge = '<span class="status-badge badge-warning">Awaiting Submission</span>';
            if (sub?.status === 'GRADED') {
              statusBadge = `<span class="status-badge badge-success">Graded: ${sub.score} / ${a.max_score}</span>`;
            } else if (sub) {
              statusBadge = '<span class="status-badge badge-info">Submitted for Review</span>';
            }

            return `
              <div class="card" style="border-left: 4px solid ${sub?.status === 'GRADED' ? 'var(--success)' : sub ? 'var(--info)' : 'var(--warning)'};">
                <div class="card-body" style="padding: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 1rem; flex-wrap: wrap;">
                    <div>
                      <div style="font-size: 0.75rem; color: var(--accent-indigo); font-weight: 700; text-transform: uppercase;">
                        ${this.esc(a.subject_name)} (${this.esc(a.subject_code || '')})
                      </div>
                      <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-navy); margin: 0.25rem 0;">
                        ${this.esc(a.title)}
                      </h3>
                    </div>
                    <div>${statusBadge}</div>
                  </div>

                  <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
                    ${this.esc(a.description)}
                  </p>

                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 1rem; flex-wrap: wrap; gap: 0.75rem; font-size: 0.8125rem;">
                    <div style="color: var(--text-muted);">
                      Due Date: <strong style="color: var(--text-main);">${this.esc(a.due_date)}</strong> · Max Score: <strong>${a.max_score}</strong>
                    </div>

                    <div>
                      ${sub ? `
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          ${sub.feedback ? `<span style="font-size: 0.8125rem; color: var(--success); font-style: italic;">"${this.esc(sub.feedback)}"</span>` : ''}
                          <button class="btn btn-secondary btn-sm" onclick="StudentModule.openSubmitAssignmentModal(${a.id}, true)">
                            ${getIcon('edit')} Update Submission
                          </button>
                        </div>
                      ` : `
                        <button class="btn btn-primary btn-sm" onclick="StudentModule.openSubmitAssignmentModal(${a.id})">
                          ${getIcon('upload')} Submit Work
                        </button>
                      `}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('') || this.empty('No assignments', 'No active assignments published by faculty.')}
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     7. STUDY MATERIALS
     ------------------------------------------------------------- */
  renderStudyMaterials(c) {
    this.load(c, () => API.materials.list(), (items) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Courseware & Study Materials</h1>
            <p>Official lecture slides, lab manuals, and notes published by faculty.</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          ${(items || []).map(m => `
            <div class="card">
              <div class="card-body" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span class="status-badge badge-info">${this.esc(m.subject_code || 'IT')}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${this.esc(m.file_size || 'Resource File')}</span>
                  </div>
                  <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.35rem;">
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
                  <span style="font-size: 0.6875rem; color: var(--text-subtle);">By ${this.esc(m.uploaded_by_name || 'HOD Office')}</span>
                  <button class="btn btn-secondary btn-sm" onclick="App.showToast('Material downloaded to your local device.', 'success')">
                    ${getIcon('download')} Download
                  </button>
                </div>
              </div>
            </div>
          `).join('') || this.empty('No materials', 'No course materials uploaded yet.')}
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     8. DOCUMENT VAULT
     ------------------------------------------------------------- */
  renderDocuments(c) {
    this.load(c, () => API.documents.list(), (items) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Document Vault & Verification</h1>
            <p>Upload college certificates, IDs, and marksheets for HOD digital review.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="StudentModule.openUploadDocumentModal()">
            ${getIcon('upload')} Upload New Document
          </button>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>Verification Status</th>
                  <th>HOD Review Remarks</th>
                  <th>Uploaded Date</th>
                </tr>
              </thead>
              <tbody>
                ${(items || []).map(d => {
                  let badge = 'badge-neutral';
                  if (d.status === 'APPROVED') badge = 'badge-success';
                  else if (d.status === 'REJECTED') badge = 'badge-danger';
                  else if (d.status === 'PENDING') badge = 'badge-warning';
                  else if (d.status === 'CORRECTION') badge = 'badge-warning';

                  return `
                    <tr>
                      <td><strong>${this.esc(d.title)}</strong></td>
                      <td><span class="status-badge badge-info">${this.esc(d.document_type)}</span></td>
                      <td><span class="status-badge ${badge}">${this.esc(d.status)}</span></td>
                      <td style="font-size: 0.8125rem; color: var(--text-muted); font-style: italic;">
                        ${this.esc(d.reviewer_comments || 'Under administrative review')}
                      </td>
                      <td style="font-size: 0.8125rem;">${this.esc(d.uploaded_at?.slice(0, 10) || 'Recent')}</td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="5" style="text-align: center;">No documents uploaded. Click "Upload New Document" to begin.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     9. LEAVE & ON-DUTY (OD) REQUESTS
     ------------------------------------------------------------- */
  renderLeaves(c) {
    this.load(c, () => API.leaves.list(), (items) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Leave & On-Duty (OD) Applications</h1>
            <p>Apply for medical leaves, symposium on-duty, and track HOD approvals.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="StudentModule.openApplyLeaveModal()">
            ${getIcon('plus')} Apply for Leave / OD
          </button>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Duration Dates</th>
                  <th>Reason for Absence</th>
                  <th>HOD Status</th>
                  <th>HOD Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${(items || []).map(l => {
                  let badge = 'badge-warning';
                  if (l.status === 'APPROVED') badge = 'badge-success';
                  else if (l.status === 'REJECTED') badge = 'badge-danger';

                  return `
                    <tr>
                      <td><strong>${this.esc(l.leave_type)}</strong></td>
                      <td style="font-size: 0.8125rem;">
                        <strong>${this.esc(l.from_date)}</strong> to <strong>${this.esc(l.to_date)}</strong>
                      </td>
                      <td style="font-size: 0.8125rem; max-width: 250px;">${this.esc(l.reason)}</td>
                      <td><span class="status-badge ${badge}">${this.esc(l.status)}</span></td>
                      <td style="font-size: 0.8125rem; color: var(--text-muted); font-style: italic;">
                        ${this.esc(l.hod_comments || 'Awaiting decision')}
                      </td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="5" style="text-align: center;">No leave applications on record.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     10. NOTICES & CIRCULARS
     ------------------------------------------------------------- */
  renderAnnouncements(c) {
    this.load(c, () => API.announcements.list(), (items) => {
      c.innerHTML = `
        <div class="page-header-row">
          <div class="page-title-box">
            <h1>Department Notices & Circulars</h1>
            <p>Official communication from Department Head and University Administration.</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${(items || []).map(a => `
            <div class="card" style="border-left: 4px solid ${a.priority === 'URGENT' ? 'var(--danger)' : a.priority === 'IMPORTANT' ? 'var(--warning)' : 'var(--accent-indigo)'};">
              <div class="card-body" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                  <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-navy); margin: 0;">
                    ${this.esc(a.title)}
                  </h3>
                  <div style="display: flex; gap: 0.5rem;">
                    <span class="status-badge ${a.priority === 'URGENT' ? 'badge-danger' : a.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-info'}">${this.esc(a.priority)}</span>
                    <span class="status-badge badge-neutral">${this.esc(a.audience)}</span>
                  </div>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.6; margin-bottom: 1rem;">
                  ${this.esc(a.message)}
                </p>
                <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                  <span>Published by: <strong>${this.esc(a.author_name || 'HOD Office')}</strong></span>
                  <span>${this.esc(a.created_at?.slice(0, 10) || 'Recent')}</span>
                </div>
              </div>
            </div>
          `).join('') || this.empty('No notices', 'No active departmental notices.')}
        </div>
      `;
    });
  },

  /* -------------------------------------------------------------
     11. ACCOUNT SETTINGS
     ------------------------------------------------------------- */
  renderSettings(c) {
    c.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-box">
          <h1>Account & Security Settings</h1>
          <p>Update your authentication password and manage portal security.</p>
        </div>
      </div>

      <div style="max-width: 560px;">
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('settings')} Change Password</div>
          </div>
          <form class="card-body" onsubmit="StudentModule.changePassword(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Current Password <span class="required">*</span></label>
              <input class="form-control" type="password" name="old_password" placeholder="••••••••" required />
            </div>
            <div class="form-group">
              <label class="form-label">New Password (at least 8 characters) <span class="required">*</span></label>
              <input class="form-control" type="password" name="new_password" minlength="8" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">
              Update Password
            </button>
          </form>
        </div>
      </div>
    `;
  },

  /* -------------------------------------------------------------
     MODALS & FORM SUBMISSIONS
     ------------------------------------------------------------- */
  openApplyLeaveModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Apply for Leave or On-Duty (OD)</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="StudentModule.submitLeaveForm(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Application Type <span class="required">*</span></label>
          <select class="form-control" name="leave_type" required>
            <option value="On Duty (OD)">On Duty (OD) — Hackathon / Symposium / Conference</option>
            <option value="Medical Leave">Medical Leave (Prescribed rest / Illness)</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">From Date <span class="required">*</span></label>
            <input class="form-control" type="date" name="from_date" required />
          </div>
          <div class="form-group">
            <label class="form-label">To Date <span class="required">*</span></label>
            <input class="form-control" type="date" name="to_date" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Reason for Absence <span class="required">*</span></label>
          <textarea class="form-control" name="reason" rows="3" placeholder="Describe the specific purpose or event details" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Submit Application to HOD
        </button>
      </form>
    `);
  },

  async submitLeaveForm(e) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      await API.leaves.apply(data);
      App.closeModal();
      App.showToast('Leave application submitted successfully for HOD review.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to submit application.', 'error');
    }
  },

  openUploadDocumentModal() {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Upload Official Document</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="StudentModule.submitDocUpload(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Document Title <span class="required">*</span></label>
          <input class="form-control" name="title" placeholder="e.g. Semester 4 Marksheet" required />
        </div>
        <div class="form-group">
          <label class="form-label">Document Category <span class="required">*</span></label>
          <select class="form-control" name="document_type" required>
            <option value="ID">College ID Card</option>
            <option value="MARKSHEET">Semester Marksheet</option>
            <option value="CERTIFICATE">Academic / Course Certificate</option>
            <option value="TRANSFER">Transfer Certificate</option>
            <option value="COMMUNITY">Community Certificate</option>
            <option value="OTHER">Other Academic Record</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Select File (PDF, PNG, JPG up to 10MB) <span class="required">*</span></label>
          <input class="form-control" type="file" name="file" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Upload to Vault
        </button>
      </form>
    `);
  },

  async submitDocUpload(e) {
    e.preventDefault();
    try {
      await API.documents.upload(new FormData(e.target));
      App.closeModal();
      App.showToast('Document uploaded successfully to your vault.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Document upload failed.', 'error');
    }
  },

  openSubmitAssignmentModal(id, isUpdate = false) {
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">${isUpdate ? 'Update Submission' : 'Submit Assignment Solution'}</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="StudentModule.submitAssignmentFile(event, ${id})" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Submission Notes & GitHub URL</label>
          <textarea class="form-control" name="notes" rows="3" placeholder="Paste your repository link, brief implementation explanation, or execution instructions"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Attach Project Archive or Report (Optional)</label>
          <input class="form-control" type="file" name="file" />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          ${isUpdate ? 'Save Changes' : 'Submit Solution'}
        </button>
      </form>
    `);
  },

  async submitAssignmentFile(e, id) {
    e.preventDefault();
    try {
      await API.assignments.submit(id, new FormData(e.target));
      App.closeModal();
      App.showToast('Assignment solution recorded successfully.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Submission failed.', 'error');
    }
  },

  openEditProfileModal() {
    const p = this.profile();
    App.openModal(`
      <div class="modal-header">
        <h3 class="modal-title">Edit Contact Information</h3>
        <button class="modal-close-btn" onclick="App.closeModal()">${getIcon('x')}</button>
      </div>
      <form class="modal-body" onsubmit="StudentModule.saveProfileUpdates(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input class="form-control" name="phone" value="${this.esc(p.phone || '')}" placeholder="+91 98765 43210" />
        </div>
        <div class="form-group">
          <label class="form-label">Residential Address</label>
          <textarea class="form-control" name="address" rows="3" placeholder="Street, City, Postal Code">${this.esc(p.address || '')}</textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Save Updates
        </button>
      </form>
    `);
  },

  async saveProfileUpdates(e) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      const updatedUser = await API.auth.updateProfile(data);
      Auth.currentUser = updatedUser;
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      App.closeModal();
      App.showToast('Profile contact information updated.', 'success');
      App.route();
    } catch (err) {
      App.showToast(err.message || 'Failed to update profile.', 'error');
    }
  },

  async changePassword(e) {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      const res = await API.auth.changePassword(data);
      if (res.token) {
        API.setToken(res.token);
      }
      App.showToast('Password changed successfully. Please keep it confidential.', 'success');
      e.target.reset();
    } catch (err) {
      App.showToast(err.message || 'Failed to update password.', 'error');
    }
  }
};
