from django.contrib import admin
from .models import (
    User, StudentProfile, HODProfile, Document, DocumentReview,
    Announcement, Notification, AuditLog,
    Attendance, TimetableSlot, Assignment, AssignmentSubmission,
    StudyMaterial, LeaveRequest, InternalMark
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('register_number', 'user', 'department', 'year', 'section', 'phone')
    list_filter = ('department', 'year', 'section')
    search_fields = ('register_number', 'user__username', 'user__first_name', 'user__last_name')


@admin.register(HODProfile)
class HODProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user', 'department', 'designation', 'phone')
    search_fields = ('employee_id', 'user__username', 'department')


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'student', 'document_type', 'status', 'version', 'uploaded_at')
    list_filter = ('status', 'document_type')
    search_fields = ('title', 'student__register_number')


@admin.register(DocumentReview)
class DocumentReviewAdmin(admin.ModelAdmin):
    list_display = ('document', 'reviewer', 'status', 'reviewed_at')
    list_filter = ('status',)


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'priority', 'audience', 'department', 'created_at')
    list_filter = ('priority', 'audience', 'department')
    search_fields = ('title', 'message')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'recipient', 'notif_type', 'is_read', 'created_at')
    list_filter = ('notif_type', 'is_read')
    search_fields = ('title', 'message', 'recipient__username')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'created_at')
    search_fields = ('action', 'description', 'user__username')


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject_code', 'date', 'period', 'status')
    list_filter = ('status', 'subject_code', 'date')
    search_fields = ('student__register_number', 'subject_name')


@admin.register(TimetableSlot)
class TimetableSlotAdmin(admin.ModelAdmin):
    list_display = ('department', 'year', 'section', 'day', 'period_number', 'subject_name', 'room')
    list_filter = ('department', 'year', 'section', 'day')


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject_name', 'department', 'year', 'due_date', 'max_score')
    list_filter = ('department', 'year', 'due_date')
    search_fields = ('title', 'subject_name')


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'status', 'score', 'submitted_at')
    list_filter = ('status',)
    search_fields = ('assignment__title', 'student__register_number')


@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject_name', 'department', 'year', 'uploaded_by', 'created_at')
    list_filter = ('department', 'year')
    search_fields = ('title', 'subject_name')


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('student', 'leave_type', 'from_date', 'to_date', 'status')
    list_filter = ('status', 'leave_type')
    search_fields = ('student__register_number', 'reason')


@admin.register(InternalMark)
class InternalMarkAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject_code', 'exam_type', 'score', 'max_score', 'semester')
    list_filter = ('exam_type', 'semester')
    search_fields = ('student__register_number', 'subject_code', 'subject_name')
