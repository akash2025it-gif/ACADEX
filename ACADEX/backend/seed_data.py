"""
ACADEX Database Seeding Script
Populates the SQLite database with realistic academic data for demonstration and testing.
"""
import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from beacadex.models import (
    StudentProfile, HODProfile, Document, DocumentReview,
    Announcement, Notification, AuditLog,
    Attendance, TimetableSlot, Assignment, AssignmentSubmission,
    StudyMaterial, LeaveRequest, InternalMark
)

User = get_user_model()
DEFAULT_PASSWORD = os.environ.get('DEMO_USER_PASSWORD', 'AcadexDemo2026!')


def seed_database():
    print("--- Seeding ACADEX Database ---")

    # 1. Create HOD User
    hod_user, created = User.objects.get_or_create(
        username='hod_it',
        defaults={
            'email': 'hod.it@acadex.edu',
            'first_name': 'Dr. R.',
            'last_name': 'Ramanathan',
            'role': 'HOD',
            'is_staff': True,
        }
    )
    hod_user.set_password(DEFAULT_PASSWORD)
    hod_user.role = 'HOD'
    hod_user.save()
    Token.objects.get_or_create(user=hod_user)

    hod_profile, _ = HODProfile.objects.get_or_create(
        user=hod_user,
        defaults={
            'employee_id': 'HOD-IT-01',
            'department': 'Information Technology',
            'designation': 'Head of Department & Professor',
            'phone': '+91 98765 11111'
        }
    )
    print(f"HOD User created: {hod_user.username} (Password@123)")

    # 2. Create Student Users
    students_data = [
        {
            'username': '25IT104',
            'first_name': 'Alex',
            'last_name': 'Johnson',
            'email': 'alex.j@acadex.edu',
            'reg_no': '25IT104',
            'year': 3,
            'section': 'B',
            'phone': '+91 98765 43210',
            'dob': datetime.date(2004, 6, 15),
            'address': '742 Evergreen Terrace, Tech Park City'
        },
        {
            'username': '25IT105',
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'email': 'priya.s@acadex.edu',
            'reg_no': '25IT105',
            'year': 3,
            'section': 'B',
            'phone': '+91 98765 43211',
            'dob': datetime.date(2004, 8, 22),
            'address': '12 Gandhi Road, Anna Nagar, Chennai'
        },
        {
            'username': '25IT106',
            'first_name': 'Rahul',
            'last_name': 'Varma',
            'email': 'rahul.v@acadex.edu',
            'reg_no': '25IT106',
            'year': 3,
            'section': 'A',
            'phone': '+91 98765 43212',
            'dob': datetime.date(2004, 3, 10),
            'address': '45 Lake View Street, Coimbatore'
        },
        {
            'username': '25IT107',
            'first_name': 'Sneha',
            'last_name': 'Patel',
            'email': 'sneha.p@acadex.edu',
            'reg_no': '25IT107',
            'year': 2,
            'section': 'A',
            'phone': '+91 98765 43213',
            'dob': datetime.date(2005, 11, 5),
            'address': '89 Hill Road, Bangalore'
        },
        {
            'username': '25IT108',
            'first_name': 'Karthik',
            'last_name': 'Raja',
            'email': 'karthik.r@acadex.edu',
            'reg_no': '25IT108',
            'year': 4,
            'section': 'B',
            'phone': '+91 98765 43214',
            'dob': datetime.date(2003, 1, 19),
            'address': '22 Marine Drive, Kochi'
        },
        {
            'username': '25IT109',
            'first_name': 'Divya',
            'last_name': 'Nair',
            'email': 'divya.n@acadex.edu',
            'reg_no': '25IT109',
            'year': 3,
            'section': 'B',
            'phone': '+91 98765 43215',
            'dob': datetime.date(2004, 9, 30),
            'address': '54 Park Avenue, Madurai'
        }
    ]

    student_profiles = {}
    for s in students_data:
        u, _ = User.objects.get_or_create(
            username=s['username'],
            defaults={
                'email': s['email'],
                'first_name': s['first_name'],
                'last_name': s['last_name'],
                'role': 'STUDENT'
            }
        )
        u.set_password(DEFAULT_PASSWORD)
        u.role = 'STUDENT'
        u.save()
        Token.objects.get_or_create(user=u)

        sp, _ = StudentProfile.objects.get_or_create(
            user=u,
            defaults={
                'register_number': s['reg_no'],
                'department': 'Information Technology',
                'course': 'B.Tech Information Technology',
                'year': s['year'],
                'section': s['section'],
                'phone': s['phone'],
                'date_of_birth': s['dob'],
                'address': s['address']
            }
        )
        student_profiles[s['reg_no']] = sp

    print(f"Created {len(student_profiles)} student profiles.")

    # 3. Create Announcements
    announcements_data = [
        {
            'title': 'Mid-Semester Examination Schedule Announced',
            'message': 'The Mid-Semester Examinations for all IT undergraduates will commence from Nov 28, 2026. Hall tickets can be downloaded from your portal.',
            'priority': 'URGENT',
            'audience': 'ALL',
            'department': 'Information Technology'
        },
        {
            'title': 'Department Hackathon: ACADEX INNOVATE 2026',
            'message': 'All 3rd and 4th year IT students are encouraged to register teams for the 24-hr Hackathon before Nov 20. Exciting cash prizes and internship opportunities.',
            'priority': 'IMPORTANT',
            'audience': 'DEPARTMENT',
            'department': 'Information Technology'
        },
        {
            'title': 'Guest Lecture on Cloud Native Computing & Kubernetes',
            'message': 'Industry architect lecture scheduled for this Friday at 2:00 PM at Seminar Hall A. Attendance is mandatory for 3rd year students.',
            'priority': 'NORMAL',
            'audience': 'YEAR',
            'department': 'Information Technology',
            'year': 3
        }
    ]

    for a in announcements_data:
        Announcement.objects.get_or_create(
            title=a['title'],
            defaults={
                'author': hod_user,
                'message': a['message'],
                'priority': a['priority'],
                'audience': a['audience'],
                'department': a.get('department', ''),
                'year': a.get('year', None)
            }
        )
    print("Announcements seeded.")

    # 4. Create Timetable Slots (Year 3, Section B)
    days = ['MON', 'TUE', 'WED', 'THU', 'FRI']
    schedule = {
        'MON': [('IT601', 'Database Management Systems', 'Dr. M. Sridhar', 'LH-302'), ('IT601', 'Database Management Systems', 'Dr. M. Sridhar', 'LH-302'), ('IT602', 'Web Technology & Cloud', 'Prof. K. Anand', 'LH-302'), ('IT602', 'Web Technology & Cloud', 'Prof. K. Anand', 'LH-302'), ('IT604', 'Computer Networks', 'Dr. A. Verma', 'LH-302'), ('IT605', 'AI & Machine Learning', 'Dr. S. Nair', 'LH-302')],
        'TUE': [('IT603', 'Design & Analysis of Algorithms', 'Dr. P. Varma', 'LH-302'), ('IT603', 'Design & Analysis of Algorithms', 'Dr. P. Varma', 'LH-302'), ('IT604', 'Computer Networks', 'Dr. A. Verma', 'LH-302'), ('IT601', 'Database Management Systems', 'Dr. M. Sridhar', 'LH-302'), ('IT605', 'AI & Machine Learning', 'Dr. S. Nair', 'LH-302'), ('IT605', 'AI & Machine Learning', 'Dr. S. Nair', 'LH-302')],
        'WED': [('IT602', 'Web Technology & Cloud', 'Prof. K. Anand', 'LH-302'), ('IT605', 'AI & Machine Learning', 'Dr. S. Nair', 'LH-302'), ('IT601', 'Database Management Systems', 'Dr. M. Sridhar', 'LH-302'), ('IT603', 'Design & Analysis of Algorithms', 'Dr. P. Varma', 'LH-302'), ('IT607', 'Networks Lab', 'Dr. A. Verma', 'Lab 2'), ('IT607', 'Networks Lab', 'Dr. A. Verma', 'Lab 2')],
        'THU': [('IT604', 'Computer Networks', 'Dr. A. Verma', 'LH-302'), ('IT601', 'Database Management Systems', 'Dr. M. Sridhar', 'LH-302'), ('IT605', 'AI & Machine Learning', 'Dr. S. Nair', 'LH-302'), ('IT602', 'Web Technology & Cloud', 'Prof. K. Anand', 'LH-302'), ('IT608', 'Web Technology Lab', 'Prof. K. Anand', 'Lab 3'), ('IT608', 'Web Technology Lab', 'Prof. K. Anand', 'Lab 3')],
        'FRI': [('IT605', 'AI & Machine Learning', 'Dr. S. Nair', 'LH-302'), ('IT604', 'Computer Networks', 'Dr. A. Verma', 'LH-302'), ('IT603', 'Design & Analysis of Algorithms', 'Dr. P. Varma', 'LH-302'), ('IT601', 'Database Management Systems', 'Dr. M. Sridhar', 'LH-302'), ('IT609', 'Algorithms Lab', 'Dr. P. Varma', 'Lab 1'), ('IT609', 'Algorithms Lab', 'Dr. P. Varma', 'Lab 1')]
    }

    times = [
        (datetime.time(9, 0), datetime.time(9, 50)),
        (datetime.time(9, 50), datetime.time(10, 40)),
        (datetime.time(11, 0), datetime.time(11, 50)),
        (datetime.time(11, 50), datetime.time(12, 40)),
        (datetime.time(13, 30), datetime.time(14, 20)),
        (datetime.time(14, 20), datetime.time(15, 10)),
    ]

    for day, slots in schedule.items():
        for idx, (code, name, fac, room) in enumerate(slots, start=1):
            st, et = times[idx - 1]
            TimetableSlot.objects.get_or_create(
                department='Information Technology',
                year=3,
                section='B',
                day=day,
                period_number=idx,
                defaults={
                    'start_time': st,
                    'end_time': et,
                    'subject_code': code,
                    'subject_name': name,
                    'faculty_name': fac,
                    'room': room
                }
            )
    print("Timetable slots seeded.")

    # 5. Create Attendance Records
    subjects = [
        ('IT601', 'Database Management Systems'),
        ('IT602', 'Web Technology & Cloud'),
        ('IT603', 'Design & Analysis of Algorithms'),
        ('IT604', 'Computer Networks'),
        ('IT605', 'AI & Machine Learning')
    ]

    base_date = datetime.date(2026, 11, 1)
    for offset in range(14):
        att_date = base_date + datetime.timedelta(days=offset)
        if att_date.weekday() >= 5:  # Skip weekends
            continue

        for code, name in subjects:
            for reg, student in student_profiles.items():
                # Realistic attendance distribution:
                # 25IT104 (Alex) ~90%, 25IT106 (Rahul) ~65% (low), 25IT108 (Karthik) ~70% (low), others ~95%
                stat = 'PRESENT'
                if reg == '25IT106' and offset % 3 == 0:
                    stat = 'ABSENT'
                elif reg == '25IT108' and offset % 4 == 0:
                    stat = 'ABSENT'
                elif reg == '25IT104' and offset == 5:
                    stat = 'OD'
                elif reg == '25IT104' and offset == 10:
                    stat = 'ABSENT'

                Attendance.objects.get_or_create(
                    student=student,
                    subject_code=code,
                    date=att_date,
                    period='Period 1 & 2',
                    defaults={
                        'subject_name': name,
                        'status': stat,
                        'marked_by': hod_user
                    }
                )
    print("Attendance records seeded.")

    # 6. Create Assignments & Submissions
    alex = student_profiles['25IT104']
    priya = student_profiles['25IT105']

    a1, _ = Assignment.objects.get_or_create(
        title='DBMS ER-Diagram & Normalization Project',
        defaults={
            'created_by': hod_user,
            'description': 'Design a complete 3NF schema for a Hospital Management System including ER Diagrams, functional dependencies and DDL scripts.',
            'department': 'Information Technology',
            'year': 3,
            'section': 'B',
            'subject_code': 'IT601',
            'subject_name': 'Database Management Systems',
            'due_date': datetime.date(2026, 11, 25),
            'max_score': 50
        }
    )

    a2, _ = Assignment.objects.get_or_create(
        title='Responsive Dashboard Design in React/HTML5',
        defaults={
            'created_by': hod_user,
            'description': 'Build an enterprise academic dashboard with responsive mobile drawer, KPI metric cards, and clean typography.',
            'department': 'Information Technology',
            'year': 3,
            'section': 'B',
            'subject_code': 'IT602',
            'subject_name': 'Web Technology & Cloud',
            'due_date': datetime.date(2026, 11, 28),
            'max_score': 50
        }
    )

    # Submissions
    AssignmentSubmission.objects.get_or_create(
        assignment=a1,
        student=priya,
        defaults={
            'notes': 'Submitted ER diagrams, relational mappings and SQL schema files.',
            'status': 'GRADED',
            'score': 49,
            'feedback': 'Flawless normalization schema and thorough documentation.'
        }
    )

    AssignmentSubmission.objects.get_or_create(
        assignment=a2,
        student=alex,
        defaults={
            'notes': 'Implemented fully modular SPA with pure CSS variables and interactive JS modules.',
            'status': 'GRADED',
            'score': 48,
            'feedback': 'Excellent UI/UX execution and smooth animations.'
        }
    )
    print("Assignments and submissions seeded.")

    # 7. Create Study Materials
    materials = [
        ('Unit 3: Relational Calculus & Query Optimization', 'Database Management Systems', 'IT601', '3.4 MB'),
        ('Complete Guide to RESTful APIs & JWT Authentication', 'Web Technology & Cloud', 'IT602', '5.1 MB'),
        ('Graph Algorithms, Dijkstra & Bellman-Ford Notes', 'Design & Analysis of Algorithms', 'IT603', '2.8 MB'),
        ('TCP/IP Protocol Suite & Network Layer Routing', 'Computer Networks', 'IT604', '4.5 MB'),
    ]

    for title, sub, code, size in materials:
        StudyMaterial.objects.get_or_create(
            title=title,
            defaults={
                'uploaded_by': hod_user,
                'description': f"Official lecture notes and reference materials for {sub}.",
                'department': 'Information Technology',
                'year': 3,
                'subject_code': code,
                'subject_name': sub,
                'file_size': size
            }
        )
    print("Study materials seeded.")

    # 8. Create Leave Requests
    LeaveRequest.objects.get_or_create(
        student=alex,
        leave_type='On Duty (OD)',
        from_date=datetime.date(2026, 11, 24),
        to_date=datetime.date(2026, 11, 25),
        defaults={
            'reason': 'Attending Inter-College Smart India Hackathon zonal round presentation.',
            'status': 'PENDING',
            'hod_comments': 'Under review by Head of Department.'
        }
    )

    LeaveRequest.objects.get_or_create(
        student=student_profiles['25IT106'],
        leave_type='Medical Leave',
        from_date=datetime.date(2026, 11, 10),
        to_date=datetime.date(2026, 11, 12),
        defaults={
            'reason': 'High fever and viral infection doctor advised 3 days rest.',
            'status': 'APPROVED',
            'hod_comments': 'Approved. Medical certificate verified.'
        }
    )
    print("Leave requests seeded.")

    # 9. Create Internal Marks
    marks_catalog = [
        (alex, 'IT601', 'Database Management Systems', 'CAT1', 46, 50),
        (alex, 'IT601', 'Database Management Systems', 'CAT2', 48, 50),
        (alex, 'IT601', 'Database Management Systems', 'MODEL', 92, 100),
        (alex, 'IT602', 'Web Technology & Cloud', 'CAT1', 44, 50),
        (alex, 'IT602', 'Web Technology & Cloud', 'CAT2', 45, 50),
        (alex, 'IT603', 'Design & Analysis of Algorithms', 'CAT1', 40, 50),
        (alex, 'IT604', 'Computer Networks', 'CAT1', 45, 50),
        (alex, 'IT605', 'AI & Machine Learning', 'CAT1', 43, 50),
        (priya, 'IT601', 'Database Management Systems', 'CAT1', 48, 50),
        (priya, 'IT602', 'Web Technology & Cloud', 'CAT1', 49, 50),
    ]

    for student, code, name, exam, score, max_s in marks_catalog:
        InternalMark.objects.get_or_create(
            student=student,
            subject_code=code,
            exam_type=exam,
            semester=5,
            defaults={
                'subject_name': name,
                'score': score,
                'max_score': max_s,
                'entered_by': hod_user
            }
        )
    print("Internal marks seeded.")

    # 10. Create Notifications
    Notification.objects.get_or_create(
        recipient=alex.user,
        title='Mid-Semester Examination Schedule Published',
        defaults={
            'message': 'Exam schedule for Semester V is now available on your portal.',
            'notif_type': 'ANNOUNCEMENT',
            'is_read': False
        }
    )
    Notification.objects.get_or_create(
        recipient=alex.user,
        title='Assignment Graded: Web Technology & Cloud',
        defaults={
            'message': 'You scored 48/50 in Responsive Dashboard Design Project.',
            'notif_type': 'ASSIGNMENT',
            'is_read': False
        }
    )
    print("Notifications seeded.")
    print("--- Database Seeding Completed Successfully! ---")


if __name__ == '__main__':
    seed_database()
