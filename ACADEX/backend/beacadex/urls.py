from django.urls import path
from . import views

urlpatterns = [
    # 1. Authentication & Profile
    path('auth/login/', views.login_view, name='login'),
    path('auth/register-student/', views.register_student_view, name='register-student'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.profile_view, name='profile'),
    path('auth/change-password/', views.change_password_view, name='change-password'),

    # 2. Announcements
    path('announcements/', views.announcements_view, name='announcements'),
    path('announcements/<int:pk>/', views.delete_announcement_view, name='delete-announcement'),

    # 3. Attendance
    path('attendance/summary/', views.student_attendance_summary_view, name='attendance-summary'),
    path('attendance/history/', views.student_attendance_history_view, name='attendance-history'),
    path('attendance/mark/', views.mark_attendance_batch_view, name='mark-attendance'),
    path('attendance/department-analytics/', views.department_attendance_analytics_view, name='department-attendance-analytics'),

    # 4. Timetable
    path('timetable/', views.timetable_view, name='timetable'),
    path('timetable/<int:pk>/', views.delete_timetable_slot_view, name='delete-timetable-slot'),

    # 5. Assignments & Submissions
    path('assignments/', views.assignments_view, name='assignments'),
    path('assignments/<int:pk>/', views.delete_assignment_view, name='delete-assignment'),
    path('assignments/<int:pk>/submit/', views.submit_assignment_view, name='submit-assignment'),
    path('assignments/<int:pk>/submissions/', views.assignment_submissions_view, name='assignment-submissions'),
    path('assignments/submissions/<int:pk>/grade/', views.grade_submission_view, name='grade-submission'),

    # 6. Study Materials
    path('study-materials/', views.study_materials_view, name='study-materials'),
    path('study-materials/<int:pk>/', views.delete_study_material_view, name='delete-study-material'),

    # 7. Documents & Reviews
    path('documents/', views.documents_view, name='documents'),
    path('documents/<int:pk>/review/', views.review_document_view, name='review-document'),

    # 8. Leave Requests
    path('leaves/', views.leaves_view, name='leaves'),
    path('leaves/<int:pk>/review/', views.review_leave_view, name='review-leave'),

    # 9. Internal Marks
    path('marks/my-marks/', views.my_marks_view, name='my-marks'),
    path('marks/', views.department_marks_view, name='department-marks'),

    # 10. Notifications
    path('notifications/', views.notifications_view, name='notifications'),
    path('notifications/<int:pk>/read/', views.mark_notification_read_view, name='notification-read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read_view, name='notifications-mark-all-read'),

    # 11. Department Overview & Student Management (HOD)
    path('department/overview/', views.department_overview_view, name='department-overview'),
    path('department/students/', views.department_students_list_view, name='department-students'),
    path('department/students/<int:pk>/', views.department_student_detail_view, name='department-student-detail'),
]
