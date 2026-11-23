from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
import datetime

from beacadex.models import (
    StudentProfile, HODProfile, Announcement,
    Attendance, Assignment, AssignmentSubmission,
    LeaveRequest, InternalMark
)

User = get_user_model()


class AcadexAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create HOD
        self.hod_user = User.objects.create_user(
            username='hod_test',
            password='TestPassword123',
            role='HOD',
            first_name='Dr. Test',
            last_name='HOD'
        )
        self.hod_profile = HODProfile.objects.create(
            user=self.hod_user,
            employee_id='HOD-TEST-01',
            department='Information Technology'
        )
        self.hod_token = Token.objects.create(user=self.hod_user)

        # Create Student
        self.student_user = User.objects.create_user(
            username='25IT999',
            password='TestPassword123',
            role='STUDENT',
            first_name='Test',
            last_name='Student'
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            register_number='25IT999',
            department='Information Technology',
            year=3,
            section='A'
        )
        self.student_token = Token.objects.create(user=self.student_user)

    def test_student_login_with_username(self):
        res = self.client.post('/api/auth/login/', {
            'username': '25IT999',
            'password': 'TestPassword123',
            'role': 'STUDENT'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['role'], 'STUDENT')

    def test_hod_login_with_employee_id(self):
        res = self.client.post('/api/auth/login/', {
            'username': 'HOD-TEST-01',
            'password': 'TestPassword123',
            'role': 'HOD'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['role'], 'HOD')

    def test_student_registration(self):
        res = self.client.post('/api/auth/register-student/', {
            'username': '25IT888',
            'first_name': 'New',
            'last_name': 'Student',
            'email': 'new.student@acadex.edu',
            'password': 'StrongPassword123',
            'register_number': '25IT888',
            'department': 'Information Technology',
            'year': 2,
            'section': 'B'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['username'], '25IT888')
        self.assertTrue(StudentProfile.objects.filter(register_number='25IT888').exists())

    def test_health_endpoint_is_public(self):
        res = self.client.get('/api/health/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'ok')


class AcadexPermissionsAndBusinessLogicTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # HOD
        self.hod_user = User.objects.create_user(
            username='hod_user', password='Password123', role='HOD'
        )
        self.hod_profile = HODProfile.objects.create(
            user=self.hod_user, employee_id='HOD-01', department='Information Technology'
        )
        self.hod_token = Token.objects.create(user=self.hod_user)

        # Student
        self.student_user = User.objects.create_user(
            username='25IT101', password='Password123', role='STUDENT'
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user, register_number='25IT101',
            department='Information Technology', year=3, section='B'
        )
        self.student_token = Token.objects.create(user=self.student_user)

    def test_student_cannot_access_hod_overview(self):
        """Verify role protection: Student cannot access HOD executive endpoint."""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.student_token.key)
        res = self.client.get('/api/department/overview/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_hod_can_access_department_overview(self):
        """HOD can access department overview."""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.hod_token.key)
        res = self.client.get('/api/department/overview/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('total_students', res.data)
        self.assertIn('avg_attendance', res.data)

    def test_hod_cannot_access_another_department_student(self):
        """Department-scoped endpoints must not disclose another department's data."""
        other_user = User.objects.create_user(username='26CS101', password='Password123', role='STUDENT')
        other_student = StudentProfile.objects.create(
            user=other_user, register_number='26CS101', department='Computer Science', year=3, section='A'
        )
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.hod_token.key)

        directory = self.client.get('/api/department/students/')
        self.assertEqual(directory.status_code, status.HTTP_200_OK)
        self.assertNotIn(other_student.id, [item['id'] for item in directory.data])

        detail = self.client.get(f'/api/department/students/{other_student.id}/')
        self.assertEqual(detail.status_code, status.HTTP_404_NOT_FOUND)

    def test_hod_cannot_mark_attendance_for_another_department(self):
        other_user = User.objects.create_user(username='26CS102', password='Password123', role='STUDENT')
        other_student = StudentProfile.objects.create(
            user=other_user, register_number='26CS102', department='Computer Science', year=3, section='A'
        )
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.hod_token.key)
        response = self.client.post('/api/attendance/mark/', {
            'subject_code': 'CS601', 'subject_name': 'Security', 'date': '2026-11-15',
            'records': [{'student_id': other_student.id, 'status': 'PRESENT'}],
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertFalse(Attendance.objects.filter(student=other_student).exists())

    def test_leave_application_and_approval_flow(self):
        """Test end-to-end leave application, listing and HOD approval."""
        # 1. Student applies for leave
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.student_token.key)
        res = self.client.post('/api/leaves/', {
            'leave_type': 'Medical Leave',
            'reason': 'Viral fever doctor advised rest',
            'from_date': '2026-11-20',
            'to_date': '2026-11-22'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        leave_id = res.data['id']
        self.assertEqual(res.data['status'], 'PENDING')

        # 2. HOD reviews and approves leave
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.hod_token.key)
        review_res = self.client.post(f'/api/leaves/{leave_id}/review/', {
            'status': 'APPROVED',
            'hod_comments': 'Approved. Take rest.'
        })
        self.assertEqual(review_res.status_code, status.HTTP_200_OK)
        self.assertEqual(review_res.data['status'], 'APPROVED')

        # 3. Check student sees updated status
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.student_token.key)
        my_leaves = self.client.get('/api/leaves/')
        self.assertEqual(my_leaves.status_code, status.HTTP_200_OK)
        self.assertEqual(my_leaves.data[0]['status'], 'APPROVED')

    def test_leave_rejects_invalid_date_range(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.student_token.key)
        response = self.client.post('/api/leaves/', {
            'leave_type': 'Medical Leave', 'reason': 'Rest',
            'from_date': '2026-11-22', 'to_date': '2026-11-20',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('to_date', response.data)

    def test_attendance_batch_marking_and_summary(self):
        """Test HOD batch marking attendance and student summary calculation."""
        # HOD marks attendance
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.hod_token.key)
        mark_res = self.client.post('/api/attendance/mark/', {
            'subject_code': 'IT601',
            'subject_name': 'Database Management Systems',
            'date': '2026-11-15',
            'period': 'Period 1',
            'records': [
                {'student_id': self.student_profile.id, 'status': 'PRESENT'}
            ]
        }, format='json')
        self.assertEqual(mark_res.status_code, status.HTTP_200_OK)

        # Student gets summary
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.student_token.key)
        sum_res = self.client.get('/api/attendance/summary/')
        self.assertEqual(sum_res.status_code, status.HTTP_200_OK)
        self.assertEqual(sum_res.data['total_classes'], 1)
        self.assertEqual(sum_res.data['attended_classes'], 1)
        self.assertEqual(sum_res.data['percentage'], 100.0)

    def test_assignment_submission_and_grading(self):
        """Test HOD creating assignment, student submitting, HOD grading."""
        # 1. HOD creates assignment
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.hod_token.key)
        assign_res = self.client.post('/api/assignments/', {
            'title': 'Test Project',
            'description': 'Implement solution',
            'department': 'Information Technology',
            'year': 3,
            'section': 'B',
            'subject_code': 'IT601',
            'subject_name': 'DBMS',
            'due_date': '2026-11-30',
            'max_score': 50
        })
        self.assertEqual(assign_res.status_code, status.HTTP_201_CREATED)
        assignment_id = assign_res.data['id']

        # 2. Student submits
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.student_token.key)
        sub_res = self.client.post(f'/api/assignments/{assignment_id}/submit/', {
            'notes': 'Completed code attached.'
        })
        self.assertEqual(sub_res.status_code, status.HTTP_201_CREATED)
        submission_id = sub_res.data['id']

        # 3. HOD grades
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.hod_token.key)
        grade_res = self.client.post(f'/api/assignments/submissions/{submission_id}/grade/', {
            'score': 47,
            'feedback': 'Well organized.'
        })
        self.assertEqual(grade_res.status_code, status.HTTP_200_OK)
        self.assertEqual(grade_res.data['score'], 47)
        self.assertEqual(grade_res.data['status'], 'GRADED')
