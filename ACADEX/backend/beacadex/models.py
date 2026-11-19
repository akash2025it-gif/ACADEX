
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


# ==================================================
# 1. USER MODEL — Custom, role-aware
# ==================================================

class User(AbstractUser):

    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('HOD', 'HOD'),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='STUDENT'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# ==================================================
# 2. STUDENT PROFILE
# ==================================================

class StudentProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )

    register_number = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    course = models.CharField(max_length=100, blank=True, default='')
    year = models.PositiveIntegerField(default=1)
    section = models.CharField(max_length=10, default='A')

    phone = models.CharField(max_length=15, blank=True, default='')
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True, default='')

    profile_photo = models.ImageField(
        upload_to='student_profiles/',
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.register_number


# ==================================================
# 3. HOD PROFILE
# ==================================================

class HODProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hod_profile'
    )

    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100, default='Head of Department')
    phone = models.CharField(max_length=15, blank=True, default='')

    def __str__(self):
        return f"{self.employee_id} – {self.department}"


# ==================================================
# 4. DOCUMENT — Student uploads
# ==================================================

class Document(models.Model):

    DOCUMENT_TYPES = [
        ('ID', 'College ID'),
        ('MARKSHEET', 'Marksheet'),
        ('CERTIFICATE', 'Certificate'),
        ('TRANSFER', 'Transfer Certificate'),
        ('COMMUNITY', 'Community Certificate'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('CORRECTION', 'Correction Required'),
        ('REJECTED', 'Rejected'),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='documents'
    )

    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=150)
    file = models.FileField(upload_to='student_documents/')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    version = models.PositiveIntegerField(default=1)

    reviewer_comments = models.TextField(blank=True, default='')

    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} – {self.student.register_number}"


# ==================================================
# 5. DOCUMENT REVIEW — HOD reviews
# ==================================================

class DocumentReview(models.Model):

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='document_reviews'
    )

    status = models.CharField(max_length=15, choices=Document.STATUS_CHOICES)
    comments = models.TextField(blank=True, default='')
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document.title} – {self.status}"


# ==================================================
# 6. ANNOUNCEMENT — HOD publishes
# ==================================================

class Announcement(models.Model):

    AUDIENCE_CHOICES = [
        ('ALL', 'All Students'),
        ('DEPARTMENT', 'Department'),
        ('YEAR', 'Specific Year'),
        ('SECTION', 'Specific Section'),
    ]

    PRIORITY_CHOICES = [
        ('NORMAL', 'Normal'),
        ('IMPORTANT', 'Important'),
        ('URGENT', 'Urgent'),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='announcements'
    )

    title = models.CharField(max_length=200)
    message = models.TextField()

    audience = models.CharField(max_length=15, choices=AUDIENCE_CHOICES, default='ALL')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='NORMAL')

    department = models.CharField(max_length=100, blank=True, default='')
    year = models.PositiveIntegerField(null=True, blank=True)
    section = models.CharField(max_length=10, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ==================================================
# 7. NOTIFICATION — Per-user inbox
# ==================================================

class Notification(models.Model):

    NOTIF_TYPES = [
        ('INFO', 'Information'),
        ('ANNOUNCEMENT', 'Announcement'),
        ('LEAVE', 'Leave Update'),
        ('DOCUMENT', 'Document Review'),
        ('MARK', 'Mark Published'),
        ('ASSIGNMENT', 'Assignment'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    title = models.CharField(max_length=200)
    message = models.TextField()
    notif_type = models.CharField(max_length=15, choices=NOTIF_TYPES, default='INFO')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ==================================================
# 8. AUDIT LOG
# ==================================================

class AuditLog(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    action = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.action


# ==================================================
# 9. ATTENDANCE — Daily subject attendance
# ==================================================

class Attendance(models.Model):

    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('OD', 'On Duty'),
        ('LATE', 'Late'),
        ('MEDICAL', 'Medical Leave'),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )

    subject_code = models.CharField(max_length=20)
    subject_name = models.CharField(max_length=150)

    date = models.DateField()
    period = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')

    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='attendance_marked'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['student', 'subject_code', 'date', 'period']

    def __str__(self):
        return f"{self.student.register_number} | {self.subject_code} | {self.date} | {self.status}"


# ==================================================
# 10. TIMETABLE SLOT — Weekly schedule entry
# ==================================================

class TimetableSlot(models.Model):

    DAY_CHOICES = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
    ]

    department = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    section = models.CharField(max_length=10)

    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    period_number = models.PositiveIntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    subject_code = models.CharField(max_length=20)
    subject_name = models.CharField(max_length=150)
    faculty_name = models.CharField(max_length=100, blank=True, default='')
    room = models.CharField(max_length=30, blank=True, default='')

    class Meta:
        ordering = ['day', 'period_number']
        unique_together = ['department', 'year', 'section', 'day', 'period_number']

    def __str__(self):
        return f"{self.department} Y{self.year}{self.section} | {self.day} P{self.period_number} | {self.subject_name}"


# ==================================================
# 11. ASSIGNMENT — HOD creates assignments
# ==================================================

class Assignment(models.Model):

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_assignments'
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')

    department = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    section = models.CharField(max_length=10, blank=True, default='')

    subject_code = models.CharField(max_length=20, blank=True, default='')
    subject_name = models.CharField(max_length=150)

    due_date = models.DateField()
    max_score = models.PositiveIntegerField(default=50)

    attachment = models.FileField(upload_to='assignment_briefs/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return self.title


# ==================================================
# 12. ASSIGNMENT SUBMISSION — Student submits
# ==================================================

class AssignmentSubmission(models.Model):

    STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted'),
        ('GRADED', 'Graded'),
        ('LATE', 'Late Submission'),
        ('RESUBMIT', 'Resubmission Required'),
    ]

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions'
    )

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='assignment_submissions'
    )

    file = models.FileField(upload_to='assignment_submissions/', null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='SUBMITTED')
    score = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True, default='')

    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['assignment', 'student']
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.register_number} – {self.assignment.title}"


# ==================================================
# 13. STUDY MATERIAL — HOD uploads course notes
# ==================================================

class StudyMaterial(models.Model):

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='study_materials'
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')

    department = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    section = models.CharField(max_length=10, blank=True, default='')

    subject_code = models.CharField(max_length=20, blank=True, default='')
    subject_name = models.CharField(max_length=150)

    file = models.FileField(upload_to='study_materials/')
    file_size = models.CharField(max_length=20, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject_name} – {self.title}"


# ==================================================
# 14. LEAVE REQUEST — Student applies
# ==================================================

class LeaveRequest(models.Model):

    LEAVE_TYPES = [
        ('Medical Leave', 'Medical Leave'),
        ('Casual Leave', 'Casual Leave'),
        ('On Duty (OD)', 'On Duty (OD)'),
        ('Emergency Leave', 'Emergency Leave'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='leave_requests'
    )

    leave_type = models.CharField(max_length=30, choices=LEAVE_TYPES)
    reason = models.TextField()

    from_date = models.DateField()
    to_date = models.DateField()

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    hod_comments = models.TextField(blank=True, default='')

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_leaves'
    )

    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.student.register_number} – {self.leave_type} ({self.status})"


# ==================================================
# 15. INTERNAL MARK — Per-student per-subject mark
# ==================================================

class InternalMark(models.Model):

    EXAM_TYPES = [
        ('CAT1', 'CAT 1 (Mid Semester 1)'),
        ('CAT2', 'CAT 2 (Mid Semester 2)'),
        ('MODEL', 'Model Examination'),
        ('ASSIGNMENT', 'Assignment Component'),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='internal_marks'
    )

    subject_code = models.CharField(max_length=20)
    subject_name = models.CharField(max_length=150)
    exam_type = models.CharField(max_length=15, choices=EXAM_TYPES)

    score = models.DecimalField(max_digits=6, decimal_places=2)
    max_score = models.DecimalField(max_digits=6, decimal_places=2, default=50)

    semester = models.PositiveIntegerField(default=1)
    academic_year = models.CharField(max_length=20, blank=True, default='')

    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='entered_marks'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['subject_code', 'exam_type']
        unique_together = ['student', 'subject_code', 'exam_type', 'semester']

    def __str__(self):
        return f"{self.student.register_number} | {self.subject_code} | {self.exam_type} | {self.score}"
