from django.contrib.auth import authenticate, get_user_model
from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import (
    StudentProfile, HODProfile, Document, DocumentReview,
    Announcement, Notification, AuditLog,
    Attendance, TimetableSlot, Assignment, AssignmentSubmission,
    StudyMaterial, LeaveRequest, InternalMark
)
from .permissions import IsHOD, IsStudent, IsOwnerOrHOD
from .serializers import (
    UserMinimalSerializer, StudentProfileSerializer, StudentProfileWriteSerializer,
    HODProfileSerializer, LoginSerializer, StudentRegisterSerializer,
    ChangePasswordSerializer, DocumentSerializer, DocumentReviewSerializer,
    AnnouncementSerializer, NotificationSerializer, AttendanceSerializer,
    BulkAttendanceSerializer, TimetableSlotSerializer, AssignmentSerializer,
    AssignmentSubmissionSerializer, GradeSubmissionSerializer,
    StudyMaterialSerializer, LeaveRequestSerializer, LeaveReviewSerializer,
    InternalMarkSerializer, DepartmentOverviewSerializer
)

User = get_user_model()


def get_user_full_data(user):
    """Helper to return consistent user JSON representation with nested profile."""
    data = UserMinimalSerializer(user).data
    if hasattr(user, 'student_profile'):
        data['student_profile'] = StudentProfileSerializer(user.student_profile).data
    elif hasattr(user, 'hod_profile'):
        data['hod_profile'] = HODProfileSerializer(user.hod_profile).data
    return data


# ===================================================================
# 1. AUTHENTICATION & PROFILE VIEWS
# ===================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate Student or HOD user and return DRF Token and profile payload.
    Supports login via username or student register_number or HOD employee_id.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username_input = serializer.validated_data['username'].strip()
    password = serializer.validated_data['password']
    role_requested = serializer.validated_data.get('role', 'STUDENT')

    # Try resolving user by username directly
    user = authenticate(username=username_input, password=password)

    # If direct username failed, check if input matches register_number (Student) or employee_id (HOD)
    if not user:
        student = StudentProfile.objects.filter(register_number__iexact=username_input).select_related('user').first()
        if student:
            user = authenticate(username=student.user.username, password=password)

    if not user:
        hod = HODProfile.objects.filter(employee_id__iexact=username_input).select_related('user').first()
        if hod:
            user = authenticate(username=hod.user.username, password=password)

    if not user:
        return Response({'detail': 'Invalid credentials. Please verify your ID and password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({'detail': 'Account is inactive. Contact the administrator.'}, status=status.HTTP_403_FORBIDDEN)

    token, _ = Token.objects.get_or_create(user=user)

    # Log action
    AuditLog.objects.create(
        user=user,
        action='User Login',
        description=f"{user.username} logged in as {user.role}"
    )

    return Response({
        'token': token.key,
        'user': get_user_full_data(user)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_student_view(request):
    """
    Register a new student with associated StudentProfile and issue authentication Token.
    """
    serializer = StudentRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    vd = serializer.validated_data

    # Create User
    user = User.objects.create_user(
        username=vd['username'],
        email=vd['email'],
        password=vd['password'],
        first_name=vd['first_name'],
        last_name=vd.get('last_name', ''),
        role='STUDENT'
    )

    # Create StudentProfile
    profile = StudentProfile.objects.create(
        user=user,
        register_number=vd['register_number'],
        department=vd['department'],
        course=vd.get('course', 'B.Tech ' + vd['department']),
        year=vd['year'],
        section=vd.get('section', 'A'),
        phone=vd.get('phone', '')
    )

    token, _ = Token.objects.get_or_create(user=user)

    # Welcome Notification
    Notification.objects.create(
        recipient=user,
        title='Welcome to ACADEX Portal',
        message=f'Hello {user.first_name}, your academic profile ({profile.register_number}) has been created successfully.',
        notif_type='INFO'
    )

    AuditLog.objects.create(
        user=user,
        action='Student Registered',
        description=f"Student {user.username} ({profile.register_number}) registered account."
    )

    return Response({
        'token': token.key,
        'user': get_user_full_data(user)
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Revoke user's authentication token and terminate session."""
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'detail': 'Successfully signed out.'})


@api_view(['GET', 'PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Retrieve or update profile details for currently authenticated user."""
    user = request.user
    if request.method == 'GET':
        return Response(get_user_full_data(user))

    # Update profile (Student)
    if hasattr(user, 'student_profile'):
        profile = user.student_profile
        serializer = StudentProfileWriteSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(get_user_full_data(user))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Update HOD profile
    if hasattr(user, 'hod_profile'):
        hod = user.hod_profile
        phone = request.data.get('phone')
        if phone is not None:
            hod.phone = phone
            hod.save()
        return Response(get_user_full_data(user))

    return Response({'detail': 'No editable profile found.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Secure password change endpoint."""
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response({'old_password': ['Current password is incorrect.']}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()

    # Re-issue new token
    Token.objects.filter(user=user).delete()
    new_token = Token.objects.create(user=user)

    return Response({'detail': 'Password updated successfully.', 'token': new_token.key})


# ===================================================================
# 2. ANNOUNCEMENTS VIEWS
# ===================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def announcements_view(request):
    """
    GET: List announcements filtered for current user.
    POST: HOD creates a new announcement.
    """
    if request.method == 'GET':
        qs = Announcement.objects.all()

        # If student, filter by audience, department and year
        if hasattr(request.user, 'student_profile'):
            student = request.user.student_profile
            qs = qs.filter(
                Q(audience='ALL') |
                Q(audience='DEPARTMENT', department__iexact=student.department) |
                Q(audience='YEAR', department__iexact=student.department, year=student.year) |
                Q(audience='SECTION', department__iexact=student.department, year=student.year, section__iexact=student.section)
            )

        serializer = AnnouncementSerializer(qs, many=True)
        return Response(serializer.data)

    # POST (HOD only)
    if not (request.user.role == 'HOD' or request.user.is_superuser):
        return Response({'detail': 'Only HOD may publish announcements.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AnnouncementSerializer(data=request.data)
    if serializer.is_valid():
        ann = serializer.save(author=request.user)
        # Audit log
        AuditLog.objects.create(
            user=request.user,
            action='Published Announcement',
            description=f"HOD published announcement: '{ann.title}' ({ann.priority})"
        )
        return Response(AnnouncementSerializer(ann).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsHOD])
def delete_announcement_view(request, pk):
    """HOD deletes an announcement."""
    try:
        ann = Announcement.objects.get(pk=pk)
    except Announcement.DoesNotExist:
        return Response({'detail': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)

    ann.delete()
    return Response({'detail': 'Announcement deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# ===================================================================
# 3. ATTENDANCE VIEWS
# ===================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def student_attendance_summary_view(request):
    """Calculate cumulative and subject-wise attendance percentages for student."""
    student = request.user.student_profile
    records = Attendance.objects.filter(student=student)

    total_classes = records.count()
    attended_classes = records.filter(status__in=['PRESENT', 'OD']).count()
    pct = round((attended_classes / total_classes * 100), 1) if total_classes > 0 else 100.0

    # Group by subject
    subjects_summary = []
    subject_codes = records.values_list('subject_code', 'subject_name').distinct()

    for code, name in subject_codes:
        sub_records = records.filter(subject_code=code)
        sub_total = sub_records.count()
        sub_attended = sub_records.filter(status__in=['PRESENT', 'OD']).count()
        sub_pct = round((sub_attended / sub_total * 100), 1) if sub_total > 0 else 100.0
        subjects_summary.append({
            'code': code,
            'name': name,
            'total': sub_total,
            'attended': sub_attended,
            'percentage': sub_pct
        })

    return Response({
        'total_classes': total_classes,
        'attended_classes': attended_classes,
        'percentage': pct,
        'subjects': subjects_summary
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def student_attendance_history_view(request):
    """Retrieve full chronological attendance logs for student."""
    student = request.user.student_profile
    qs = Attendance.objects.filter(student=student).order_by('-date', '-period')

    status_filter = request.query_params.get('status')
    if status_filter and status_filter != 'ALL':
        qs = qs.filter(status=status_filter.upper())

    serializer = AttendanceSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsHOD])
def mark_attendance_batch_view(request):
    """HOD marks batch attendance for students in a class period."""
    serializer = BulkAttendanceSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    vd = serializer.validated_data
    subject_code = vd['subject_code']
    subject_name = vd['subject_name']
    att_date = vd['date']
    period = vd.get('period', '')

    saved_count = 0
    for item in vd['records']:
        student_id = item.get('student_id')
        stat = item.get('status', 'PRESENT')
        try:
            student = StudentProfile.objects.get(pk=student_id)
            Attendance.objects.update_or_create(
                student=student,
                subject_code=subject_code,
                date=att_date,
                period=period,
                defaults={
                    'subject_name': subject_name,
                    'status': stat,
                    'marked_by': request.user
                }
            )
            saved_count += 1
        except StudentProfile.DoesNotExist:
            continue

    AuditLog.objects.create(
        user=request.user,
        action='Recorded Attendance',
        description=f"Marked attendance for {saved_count} students in {subject_name} on {att_date}"
    )

    return Response({'detail': f'Recorded attendance for {saved_count} students.', 'count': saved_count})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHOD])
def department_attendance_analytics_view(request):
    """Department-wide attendance statistics and low-attendance watchlist."""
    dept = getattr(request.user.hod_profile, 'department', '') if hasattr(request.user, 'hod_profile') else ''
    students = StudentProfile.objects.all()
    if dept:
        students = students.filter(department__iexact=dept)

    watchlist = []
    all_pcts = []

    for s in students:
        recs = Attendance.objects.filter(student=s)
        tot = recs.count()
        att = recs.filter(status__in=['PRESENT', 'OD']).count()
        pct = round((att / tot * 100), 1) if tot > 0 else 100.0
        all_pcts.append(pct)

        if pct < 75.0:
            watchlist.append({
                'id': s.id,
                'name': f"{s.user.first_name} {s.user.last_name}",
                'reg_no': s.register_number,
                'year': s.year,
                'section': s.section,
                'phone': s.phone,
                'attendance': pct
            })

    dept_avg = round(sum(all_pcts) / len(all_pcts), 1) if all_pcts else 100.0

    return Response({
        'department_average': dept_avg,
        'low_attendance_count': len(watchlist),
        'watchlist': watchlist
    })


# ===================================================================
# 4. TIMETABLE VIEWS
# ===================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def timetable_view(request):
    """
    GET: Retrieve timetable slots.
    POST: HOD creates or updates a slot.
    """
    if request.method == 'GET':
        dept = request.query_params.get('department')
        year = request.query_params.get('year')
        sec = request.query_params.get('section')

        qs = TimetableSlot.objects.all()

        if hasattr(request.user, 'student_profile'):
            student = request.user.student_profile
            qs = qs.filter(department__iexact=student.department, year=student.year, section__iexact=student.section)
        else:
            if dept:
                qs = qs.filter(department__iexact=dept)
            if year:
                qs = qs.filter(year=year)
            if sec:
                qs = qs.filter(section__iexact=sec)

        serializer = TimetableSlotSerializer(qs, many=True)
        return Response(serializer.data)

    # POST (HOD only)
    if not (request.user.role == 'HOD' or request.user.is_superuser):
        return Response({'detail': 'Only HOD may configure timetables.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = TimetableSlotSerializer(data=request.data)
    if serializer.is_valid():
        slot = serializer.save()
        return Response(TimetableSlotSerializer(slot).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsHOD])
def delete_timetable_slot_view(request, pk):
    try:
        slot = TimetableSlot.objects.get(pk=pk)
    except TimetableSlot.DoesNotExist:
        return Response({'detail': 'Slot not found.'}, status=status.HTTP_404_NOT_FOUND)
    slot.delete()
    return Response({'detail': 'Slot deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ===================================================================
# 5. ASSIGNMENTS & SUBMISSIONS VIEWS
# ===================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def assignments_view(request):
    """
    GET: List assignments.
    POST: HOD creates a new assignment.
    """
    if request.method == 'GET':
        qs = Assignment.objects.all()
        if hasattr(request.user, 'student_profile'):
            s = request.user.student_profile
            qs = qs.filter(department__iexact=s.department, year=s.year)

        serializer = AssignmentSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    # POST (HOD only)
    if not (request.user.role == 'HOD' or request.user.is_superuser):
        return Response({'detail': 'Only HOD may create assignments.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AssignmentSerializer(data=request.data)
    if serializer.is_valid():
        assignment = serializer.save(created_by=request.user)
        AuditLog.objects.create(
            user=request.user,
            action='Created Assignment',
            description=f"Created assignment '{assignment.title}' for {assignment.subject_name}"
        )
        return Response(AssignmentSerializer(assignment, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsHOD])
def delete_assignment_view(request, pk):
    try:
        assignment = Assignment.objects.get(pk=pk)
    except Assignment.DoesNotExist:
        return Response({'detail': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)
    assignment.delete()
    return Response({'detail': 'Assignment deleted.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
@parser_classes([MultiPartParser, FormParser])
def submit_assignment_view(request, pk):
    """Student submits file/notes for an assignment."""
    try:
        assignment = Assignment.objects.get(pk=pk)
    except Assignment.DoesNotExist:
        return Response({'detail': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    student = request.user.student_profile
    file_obj = request.FILES.get('file')
    notes = request.data.get('notes', '')

    submission, created = AssignmentSubmission.objects.update_or_create(
        assignment=assignment,
        student=student,
        defaults={
            'file': file_obj if file_obj else None,
            'notes': notes,
            'status': 'SUBMITTED',
            'submitted_at': timezone.now()
        }
    )

    return Response(AssignmentSubmissionSerializer(submission).data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHOD])
def assignment_submissions_view(request, pk):
    """HOD reviews all submissions for an assignment."""
    try:
        assignment = Assignment.objects.get(pk=pk)
    except Assignment.DoesNotExist:
        return Response({'detail': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    subs = assignment.submissions.all()
    serializer = AssignmentSubmissionSerializer(subs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsHOD])
def grade_submission_view(request, pk):
    """HOD evaluates and grades a student submission."""
    try:
        sub = AssignmentSubmission.objects.get(pk=pk)
    except AssignmentSubmission.DoesNotExist:
        return Response({'detail': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = GradeSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    score = serializer.validated_data['score']
    feedback = serializer.validated_data.get('feedback', '')

    sub.score = score
    sub.feedback = feedback
    sub.status = 'GRADED'
    sub.graded_at = timezone.now()
    sub.save()

    # Notify student
    Notification.objects.create(
        recipient=sub.student.user,
        title='Assignment Graded',
        message=f"Your submission for '{sub.assignment.title}' was graded: {score}/{sub.assignment.max_score} points.",
        notif_type='ASSIGNMENT'
    )

    return Response(AssignmentSubmissionSerializer(sub).data)


# ===================================================================
# 6. STUDY MATERIALS VIEWS
# ===================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def study_materials_view(request):
    """
    GET: List materials.
    POST: HOD uploads lecture notes/materials.
    """
    if request.method == 'GET':
        qs = StudyMaterial.objects.all()
        if hasattr(request.user, 'student_profile'):
            s = request.user.student_profile
            qs = qs.filter(department__iexact=s.department, year=s.year)

        serializer = StudyMaterialSerializer(qs, many=True)
        return Response(serializer.data)

    if not (request.user.role == 'HOD' or request.user.is_superuser):
        return Response({'detail': 'Only HOD may upload study materials.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = StudyMaterialSerializer(data=request.data)
    if serializer.is_valid():
        file_obj = request.FILES.get('file')
        file_size_str = ''
        if file_obj:
            file_size_str = f"{round(file_obj.size / (1024 * 1024), 1)} MB"

        mat = serializer.save(uploaded_by=request.user, file_size=file_size_str)
        return Response(StudyMaterialSerializer(mat).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsHOD])
def delete_study_material_view(request, pk):
    try:
        mat = StudyMaterial.objects.get(pk=pk)
    except StudyMaterial.DoesNotExist:
        return Response({'detail': 'Material not found.'}, status=status.HTTP_404_NOT_FOUND)
    mat.delete()
    return Response({'detail': 'Study material deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ===================================================================
# 7. DOCUMENTS & REVIEWS VIEWS
# ===================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def documents_view(request):
    """
    GET: Student views own documents; HOD views all department documents.
    POST: Student uploads a certificate/document.
    """
    if request.method == 'GET':
        if hasattr(request.user, 'student_profile'):
            qs = Document.objects.filter(student=request.user.student_profile)
        else:
            qs = Document.objects.all()
        serializer = DocumentSerializer(qs, many=True)
        return Response(serializer.data)

    # POST (Student upload)
    if not hasattr(request.user, 'student_profile'):
        return Response({'detail': 'Only students may upload documents.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = DocumentSerializer(data=request.data)
    if serializer.is_valid():
        doc = serializer.save(student=request.user.student_profile)
        AuditLog.objects.create(
            user=request.user,
            action='Uploaded Document',
            description=f"Student {request.user.student_profile.register_number} uploaded '{doc.title}' ({doc.document_type})"
        )
        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsHOD])
def review_document_view(request, pk):
    """HOD reviews student document (Approved, Correction, Rejected)."""
    try:
        doc = Document.objects.get(pk=pk)
    except Document.DoesNotExist:
        return Response({'detail': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DocumentReviewSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_status = serializer.validated_data['status']
    comments = serializer.validated_data.get('comments', '')

    doc.status = new_status
    doc.reviewer_comments = comments
    doc.save()

    DocumentReview.objects.create(
        document=doc,
        reviewer=request.user,
        status=new_status,
        comments=comments
    )

    # Notify student
    Notification.objects.create(
        recipient=doc.student.user,
        title=f"Document Review: {doc.title}",
        message=f"Your document '{doc.title}' has been {new_status.lower()}. {comments}",
        notif_type='DOCUMENT'
    )

    return Response(DocumentSerializer(doc).data)


# ===================================================================
# 8. LEAVE REQUESTS VIEWS
# ===================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def leaves_view(request):
    """
    GET: Student views own requests; HOD views department pending/all requests.
    POST: Student applies for leave / OD.
    """
    if request.method == 'GET':
        if hasattr(request.user, 'student_profile'):
            qs = LeaveRequest.objects.filter(student=request.user.student_profile)
        else:
            qs = LeaveRequest.objects.all()
        serializer = LeaveRequestSerializer(qs, many=True)
        return Response(serializer.data)

    # POST (Student apply)
    if not hasattr(request.user, 'student_profile'):
        return Response({'detail': 'Only students may apply for leaves.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = LeaveRequestSerializer(data=request.data)
    if serializer.is_valid():
        leave = serializer.save(student=request.user.student_profile)
        AuditLog.objects.create(
            user=request.user,
            action='Applied for Leave',
            description=f"Student {request.user.student_profile.register_number} applied for {leave.leave_type} ({leave.from_date} to {leave.to_date})"
        )
        return Response(LeaveRequestSerializer(leave).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsHOD])
def review_leave_view(request, pk):
    """HOD approves or rejects student leave request."""
    try:
        leave = LeaveRequest.objects.get(pk=pk)
    except LeaveRequest.DoesNotExist:
        return Response({'detail': 'Leave request not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = LeaveReviewSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_status = serializer.validated_data['status']
    comments = serializer.validated_data.get('hod_comments', '')

    leave.status = new_status
    leave.hod_comments = comments
    leave.reviewed_by = request.user
    leave.reviewed_at = timezone.now()
    leave.save()

    # Notify student
    Notification.objects.create(
        recipient=leave.student.user,
        title=f"Leave Application {new_status.capitalize()}",
        message=f"Your {leave.leave_type} application from {leave.from_date} to {leave.to_date} was {new_status.lower()}. {comments}",
        notif_type='LEAVE'
    )

    return Response(LeaveRequestSerializer(leave).data)


# ===================================================================
# 9. INTERNAL MARKS VIEWS
# ===================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def my_marks_view(request):
    """Student views their internal assessment test marks and grades."""
    student = request.user.student_profile
    qs = InternalMark.objects.filter(student=student)
    serializer = InternalMarkSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsHOD])
def department_marks_view(request):
    """
    GET: HOD lists/filters class marks.
    POST: HOD records/updates internal marks.
    """
    if request.method == 'GET':
        qs = InternalMark.objects.all()
        sub = request.query_params.get('subject_code')
        exam = request.query_params.get('exam_type')
        if sub:
            qs = qs.filter(subject_code=sub)
        if exam:
            qs = qs.filter(exam_type=exam)
        serializer = InternalMarkSerializer(qs, many=True)
        return Response(serializer.data)

    # POST (save mark)
    serializer = InternalMarkSerializer(data=request.data)
    if serializer.is_valid():
        mark = serializer.save(entered_by=request.user)
        return Response(InternalMarkSerializer(mark).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ===================================================================
# 10. NOTIFICATIONS VIEWS
# ===================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_view(request):
    """List inbox notifications for current user."""
    qs = Notification.objects.filter(recipient=request.user)
    serializer = NotificationSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read_view(request, pk):
    """Mark a notification as read."""
    try:
        notif = Notification.objects.get(pk=pk, recipient=request.user)
        notif.is_read = True
        notif.save()
        return Response({'detail': 'Marked as read.'})
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read_view(request):
    """Mark all notifications as read for current user."""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'detail': 'All notifications marked as read.'})


# ===================================================================
# 11. DEPARTMENT OVERVIEW & STUDENTS MANAGEMENT (HOD)
# ===================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHOD])
def department_overview_view(request):
    """Comprehensive executive KPI summary for Head of Department."""
    dept = getattr(request.user.hod_profile, 'department', 'Information Technology') if hasattr(request.user, 'hod_profile') else 'Information Technology'
    students = StudentProfile.objects.all()

    total_students = students.count()
    pending_leaves = LeaveRequest.objects.filter(status='PENDING').count()
    pending_docs = Document.objects.filter(status='PENDING').count()
    active_assignments = Assignment.objects.filter(due_date__gte=timezone.now().date()).count()

    # Attendance average
    records = Attendance.objects.all()
    tot = records.count()
    att = records.filter(status__in=['PRESENT', 'OD']).count()
    dept_avg = round((att / tot * 100), 1) if tot > 0 else 88.5

    # Low attendance count (<75%)
    low_att_count = 0
    for s in students:
        s_recs = records.filter(student=s)
        s_tot = s_recs.count()
        if s_tot > 0:
            s_pct = (s_recs.filter(status__in=['PRESENT', 'OD']).count() / s_tot) * 100
            if s_pct < 75.0:
                low_att_count += 1

    payload = {
        'total_students': total_students,
        'department': dept,
        'avg_attendance': dept_avg,
        'pending_leaves': pending_leaves,
        'pending_documents': pending_docs,
        'active_assignments': active_assignments,
        'low_attendance_count': low_att_count
    }
    return Response(payload)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHOD])
def department_students_list_view(request):
    """
    Search and filter students by name, register number, year, section.
    Returns student list with attendance rates and status badges.
    """
    qs = StudentProfile.objects.select_related('user').all()

    search = request.query_params.get('search')
    year = request.query_params.get('year')
    sec = request.query_params.get('section')

    if search:
        qs = qs.filter(
            Q(register_number__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search)
        )
    if year and year != 'ALL':
        qs = qs.filter(year=year)
    if sec and sec != 'ALL':
        qs = qs.filter(section__iexact=sec)

    results = []
    for s in qs:
        recs = Attendance.objects.filter(student=s)
        tot = recs.count()
        att = recs.filter(status__in=['PRESENT', 'OD']).count()
        pct = round((att / tot * 100), 1) if tot > 0 else 100.0

        results.append({
            'id': s.id,
            'name': f"{s.user.first_name} {s.user.last_name}".strip() or s.user.username,
            'reg_no': s.register_number,
            'year': s.year,
            'section': s.section,
            'attendance': pct,
            'email': s.user.email,
            'phone': s.phone,
            'status': 'Active' if pct >= 75 else 'Low Attendance'
        })

    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHOD])
def department_student_detail_view(request, pk):
    """Inspect complete 360-degree student academic dossier."""
    try:
        student = StudentProfile.objects.select_related('user').get(pk=pk)
    except StudentProfile.DoesNotExist:
        return Response({'detail': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

    data = StudentProfileSerializer(student).data
    data['attendance_summary'] = student_attendance_summary_view(request._request).data if hasattr(request, '_request') else {}
    data['leaves'] = LeaveRequestSerializer(student.leave_requests.all(), many=True).data
    data['documents'] = DocumentSerializer(student.documents.all(), many=True).data
    data['marks'] = InternalMarkSerializer(student.internal_marks.all(), many=True).data

    return Response(data)
