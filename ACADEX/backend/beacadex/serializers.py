from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    StudentProfile, HODProfile, Document, DocumentReview,
    Announcement, Notification, AuditLog,
    Attendance, TimetableSlot, Assignment, AssignmentSubmission,
    StudyMaterial, LeaveRequest, InternalMark
)

User = get_user_model()


# =====================================================
# USER SERIALIZERS
# =====================================================

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role']
        read_only_fields = ['id', 'role']


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'register_number', 'department', 'course',
            'year', 'section', 'phone', 'date_of_birth', 'address',
            'profile_photo', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class StudentProfileWriteSerializer(serializers.ModelSerializer):
    """Used when student updates their own profile."""
    class Meta:
        model = StudentProfile
        fields = ['phone', 'date_of_birth', 'address', 'profile_photo']


class HODProfileSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = HODProfile
        fields = ['id', 'user', 'employee_id', 'department', 'designation', 'phone']
        read_only_fields = ['id']


# =====================================================
# AUTH SERIALIZERS
# =====================================================

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role     = serializers.ChoiceField(choices=['STUDENT', 'HOD'], required=False, default='STUDENT')


class StudentRegisterSerializer(serializers.Serializer):
    username        = serializers.CharField(max_length=150)
    first_name      = serializers.CharField(max_length=150)
    last_name       = serializers.CharField(max_length=150, required=False, default='')
    email           = serializers.EmailField()
    password        = serializers.CharField(write_only=True, min_length=8)
    register_number = serializers.CharField(max_length=20)
    department      = serializers.CharField(max_length=100)
    course          = serializers.CharField(max_length=100, required=False, default='')
    year            = serializers.IntegerField(min_value=1, max_value=4)
    section         = serializers.CharField(max_length=10, required=False, default='A')
    phone           = serializers.CharField(max_length=15, required=False, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_register_number(self, value):
        if StudentProfile.objects.filter(register_number=value).exists():
            raise serializers.ValidationError("This register number is already registered.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already registered.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)


# =====================================================
# DOCUMENT SERIALIZERS
# =====================================================

class DocumentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_reg  = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'student', 'student_name', 'student_reg',
            'document_type', 'title', 'file', 'status',
            'version', 'reviewer_comments', 'uploaded_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'uploaded_at', 'updated_at', 'status', 'reviewer_comments']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def get_student_reg(self, obj):
        return obj.student.register_number


class DocumentReviewSerializer(serializers.Serializer):
    status   = serializers.ChoiceField(choices=['APPROVED', 'CORRECTION', 'REJECTED'])
    comments = serializers.CharField(required=False, default='', allow_blank=True)


# =====================================================
# ANNOUNCEMENT SERIALIZERS
# =====================================================

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'author', 'author_name', 'title', 'message',
            'audience', 'priority', 'department', 'year', 'section',
            'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'author', 'created_at']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username


# =====================================================
# NOTIFICATION SERIALIZER
# =====================================================

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notif_type', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


# =====================================================
# ATTENDANCE SERIALIZERS
# =====================================================

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_reg  = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'student_reg',
            'subject_code', 'subject_name', 'date', 'period',
            'status', 'marked_by', 'created_at'
        ]
        read_only_fields = ['id', 'marked_by', 'created_at']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def get_student_reg(self, obj):
        return obj.student.register_number


class BulkAttendanceSerializer(serializers.Serializer):
    """HOD marks attendance for multiple students at once."""
    subject_code = serializers.CharField(max_length=20)
    subject_name = serializers.CharField(max_length=150)
    date         = serializers.DateField()
    period       = serializers.CharField(max_length=50, required=False, default='')
    records      = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )
    # records = [{"student_id": 1, "status": "PRESENT"}, ...]


# =====================================================
# TIMETABLE SERIALIZER
# =====================================================

class TimetableSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimetableSlot
        fields = [
            'id', 'department', 'year', 'section',
            'day', 'period_number', 'start_time', 'end_time',
            'subject_code', 'subject_name', 'faculty_name', 'room'
        ]
        read_only_fields = ['id']


# =====================================================
# ASSIGNMENT & SUBMISSION SERIALIZERS
# =====================================================

class AssignmentSerializer(serializers.ModelSerializer):
    created_by_name   = serializers.SerializerMethodField()
    submission_count  = serializers.SerializerMethodField()
    my_submission     = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id', 'created_by', 'created_by_name', 'title', 'description',
            'department', 'year', 'section', 'subject_code', 'subject_name',
            'due_date', 'max_score', 'attachment',
            'submission_count', 'my_submission', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username

    def get_submission_count(self, obj):
        return obj.submissions.count()

    def get_my_submission(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            sub = obj.submissions.filter(student=request.user.student_profile).first()
            if sub:
                return AssignmentSubmissionSerializer(sub, context=self.context).data
        return None


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_reg  = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'student', 'student_name', 'student_reg',
            'file', 'notes', 'status', 'score', 'feedback',
            'submitted_at', 'graded_at'
        ]
        read_only_fields = ['id', 'assignment', 'student', 'submitted_at', 'graded_at', 'status', 'score', 'feedback']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def get_student_reg(self, obj):
        return obj.student.register_number


class GradeSubmissionSerializer(serializers.Serializer):
    score    = serializers.IntegerField(min_value=0)
    feedback = serializers.CharField(required=False, default='', allow_blank=True)


# =====================================================
# STUDY MATERIAL SERIALIZER
# =====================================================

class StudyMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudyMaterial
        fields = [
            'id', 'uploaded_by', 'uploaded_by_name', 'title', 'description',
            'department', 'year', 'section', 'subject_code', 'subject_name',
            'file', 'file_size', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at']

    def get_uploaded_by_name(self, obj):
        return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip() or obj.uploaded_by.username


# =====================================================
# LEAVE REQUEST SERIALIZERS
# =====================================================

class LeaveRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_reg  = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'student', 'student_name', 'student_reg',
            'leave_type', 'reason', 'from_date', 'to_date',
            'status', 'hod_comments', 'reviewed_by', 'applied_at', 'reviewed_at'
        ]
        read_only_fields = [
            'id', 'student', 'status', 'hod_comments', 'reviewed_by',
            'applied_at', 'reviewed_at'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def get_student_reg(self, obj):
        return obj.student.register_number


class LeaveReviewSerializer(serializers.Serializer):
    status      = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    hod_comments = serializers.CharField(required=False, default='', allow_blank=True)


# =====================================================
# INTERNAL MARK SERIALIZERS
# =====================================================

class InternalMarkSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_reg  = serializers.SerializerMethodField()

    class Meta:
        model = InternalMark
        fields = [
            'id', 'student', 'student_name', 'student_reg',
            'subject_code', 'subject_name', 'exam_type',
            'score', 'max_score', 'semester', 'academic_year',
            'entered_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'entered_by', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def get_student_reg(self, obj):
        return obj.student.register_number


# =====================================================
# DEPARTMENT OVERVIEW SERIALIZER
# =====================================================

class DepartmentOverviewSerializer(serializers.Serializer):
    total_students        = serializers.IntegerField()
    department            = serializers.CharField()
    avg_attendance        = serializers.FloatField()
    pending_leaves        = serializers.IntegerField()
    pending_documents     = serializers.IntegerField()
    active_assignments    = serializers.IntegerField()
    low_attendance_count  = serializers.IntegerField()
