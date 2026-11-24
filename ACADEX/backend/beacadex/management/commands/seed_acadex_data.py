import os
import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from beacadex.models import (
    StudentProfile, HODProfile, Document, DocumentReview,
    Announcement, Notification, AuditLog,
    Attendance, TimetableSlot, Assignment, AssignmentSubmission,
    StudyMaterial, LeaveRequest, InternalMark
)

User = get_user_model()

DEFAULT_STUDENT_PASSWORD = os.environ.get('DEMO_USER_PASSWORD', 'AcadexDemo2026!')
DEFAULT_HOD_PASSWORD = os.environ.get('DEMO_HOD_PASSWORD', 'AcadexDemo!Hod2026#7x')


class Command(BaseCommand):
    help = 'Seeds ACADEX database with realistic academic data for demonstration and testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-seeding even if data already exists',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- Seeding ACADEX Database ---'))
        force_reseed = options.get('force') or os.environ.get('FORCE_RESEED', '').lower() in ('true', '1')

        # -------------------------------------------------------------
        # 1. HOD USERS (Standard HOD + Dedicated Demo HOD)
        # -------------------------------------------------------------
        hod_users_data = [
            {
                'username': 'hod_it',
                'email': 'hod.it@acadex.edu',
                'first_name': 'Dr. R.',
                'last_name': 'Ramanathan',
                'employee_id': 'HOD-IT-01',
                'department': 'Information Technology',
                'designation': 'Head of Department & Professor',
                'phone': '+91 98765 11111',
                'password': DEFAULT_STUDENT_PASSWORD
            },
            {
                'username': 'hod_demo',
                'email': 'hod.demo@acadex.example',
                'first_name': 'Dr. K.',
                'last_name': 'Srinivasan',
                'employee_id': 'HOD-DEMO-01',
                'department': 'Information Technology',
                'designation': 'Head of Department (Executive Demo)',
                'phone': '+91 98765 22222',
                'password': DEFAULT_HOD_PASSWORD
            }
        ]

        hod_instances = {}
        for h in hod_users_data:
            user, created = User.objects.get_or_create(
                username=h['username'],
                defaults={
                    'email': h['email'],
                    'first_name': h['first_name'],
                    'last_name': h['last_name'],
                    'role': 'HOD',
                    'is_staff': True,
                }
            )
            user.set_password(h['password'])
            user.role = 'HOD'
            user.email = h['email']
            user.first_name = h['first_name']
            user.last_name = h['last_name']
            user.save()
            Token.objects.get_or_create(user=user)

            profile, _ = HODProfile.objects.get_or_create(
                user=user,
                defaults={
                    'employee_id': h['employee_id'],
                    'department': h['department'],
                    'designation': h['designation'],
                    'phone': h['phone']
                }
            )
            profile.employee_id = h['employee_id']
            profile.department = h['department']
            profile.designation = h['designation']
            profile.phone = h['phone']
            profile.save()
            hod_instances[h['username']] = user
            self.stdout.write(f"HOD User configured: {user.username} ({user.email})")

        primary_hod = hod_instances['hod_it']
        demo_hod = hod_instances['hod_demo']

        # -------------------------------------------------------------
        # 2. FICTIONAL STUDENTS (15 Students covering 4 Years & 2 Sections)
        # -------------------------------------------------------------
        students_data = [
            {
                'username': '25IT101',
                'reg_no': '25IT101',
                'first_name': 'Aarav',
                'last_name': 'Kumar',
                'email': 'aarav.k@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43201',
                'dob': datetime.date(2004, 5, 12),
                'address': '14 Anna Nagar West, Chennai',
                'present_rate': 0.96
            },
            {
                'username': '25IT102',
                'reg_no': '25IT102',
                'first_name': 'Ananya',
                'last_name': 'Sharma',
                'email': 'ananya.s@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43202',
                'dob': datetime.date(2004, 7, 24),
                'address': '28 Besant Nagar, Chennai',
                'present_rate': 0.92
            },
            {
                'username': '25IT103',
                'reg_no': '25IT103',
                'first_name': 'Rohan',
                'last_name': 'Gupta',
                'email': 'rohan.g@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43203',
                'dob': datetime.date(2004, 4, 18),
                'address': '104 T. Nagar, Chennai',
                'present_rate': 0.84
            },
            {
                'username': '25IT104',  # Primary Student Account
                'reg_no': '25IT104',
                'first_name': 'Alex',
                'last_name': 'Johnson',
                'email': 'alex.j@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43210',
                'dob': datetime.date(2004, 6, 15),
                'address': '742 Evergreen Terrace, Tech Park City',
                'present_rate': 0.90
            },
            {
                'username': '25IT105',
                'reg_no': '25IT105',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'email': 'priya.s@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43211',
                'dob': datetime.date(2004, 8, 22),
                'address': '12 Gandhi Road, Anna Nagar, Chennai',
                'present_rate': 0.80
            },
            {
                'username': '25IT106',  # Low attendance student
                'reg_no': '25IT106',
                'first_name': 'Rahul',
                'last_name': 'Varma',
                'email': 'rahul.v@acadex.edu',
                'year': 3,
                'section': 'A',
                'phone': '+91 98765 43212',
                'dob': datetime.date(2004, 3, 10),
                'address': '45 Lake View Street, Coimbatore',
                'present_rate': 0.64
            },
            {
                'username': '25IT107',  # Low attendance student
                'reg_no': '25IT107',
                'first_name': 'Sneha',
                'last_name': 'Patel',
                'email': 'sneha.p@acadex.edu',
                'year': 2,
                'section': 'A',
                'phone': '+91 98765 43213',
                'dob': datetime.date(2005, 11, 5),
                'address': '89 Hill Road, Bangalore',
                'present_rate': 0.70
            },
            {
                'username': '25IT108',
                'reg_no': '25IT108',
                'first_name': 'Karthik',
                'last_name': 'Raja',
                'email': 'karthik.r@acadex.edu',
                'year': 4,
                'section': 'B',
                'phone': '+91 98765 43214',
                'dob': datetime.date(2003, 1, 19),
                'address': '22 Marine Drive, Kochi',
                'present_rate': 0.88
            },
            {
                'username': '25IT109',
                'reg_no': '25IT109',
                'first_name': 'Divya',
                'last_name': 'Nair',
                'email': 'divya.n@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43215',
                'dob': datetime.date(2004, 9, 30),
                'address': '54 Park Avenue, Madurai',
                'present_rate': 0.94
            },
            {
                'username': '25IT110',
                'reg_no': '25IT110',
                'first_name': 'Vikram',
                'last_name': 'Singh',
                'email': 'vikram.s@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43216',
                'dob': datetime.date(2004, 2, 14),
                'address': '67 Cyber City Road, Hyderabad',
                'present_rate': 0.86
            },
            {
                'username': '25IT111',
                'reg_no': '25IT111',
                'first_name': 'Meera',
                'last_name': 'Krishnan',
                'email': 'meera.k@acadex.edu',
                'year': 3,
                'section': 'A',
                'phone': '+91 98765 43217',
                'dob': datetime.date(2004, 10, 8),
                'address': '31 Temple Street, Trichy',
                'present_rate': 0.92
            },
            {
                'username': '25IT112',
                'reg_no': '25IT112',
                'first_name': 'Sanjay',
                'last_name': 'Verma',
                'email': 'sanjay.v@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43218',
                'dob': datetime.date(2004, 12, 3),
                'address': '18 Station Road, Salem',
                'present_rate': 0.82
            },
            {
                'username': '25IT113',
                'reg_no': '25IT113',
                'first_name': 'Pooja',
                'last_name': 'Reddy',
                'email': 'pooja.r@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43219',
                'dob': datetime.date(2004, 8, 17),
                'address': '92 MG Road, Vijayawada',
                'present_rate': 0.88
            },
            {
                'username': '25IT114',
                'reg_no': '25IT114',
                'first_name': 'Siddharth',
                'last_name': 'Iyer',
                'email': 'siddharth.i@acadex.edu',
                'year': 3,
                'section': 'A',
                'phone': '+91 98765 43220',
                'dob': datetime.date(2004, 1, 29),
                'address': '55 Heritage Enclave, Thanjavur',
                'present_rate': 0.90
            },
            {
                'username': '25IT115',
                'reg_no': '25IT115',
                'first_name': 'Kaviya',
                'last_name': 'Sundaram',
                'email': 'kaviya.s@acadex.edu',
                'year': 3,
                'section': 'B',
                'phone': '+91 98765 43221',
                'dob': datetime.date(2004, 11, 11),
                'address': '84 Cross Street, Erode',
                'present_rate': 0.94
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
            u.set_password(DEFAULT_STUDENT_PASSWORD)
            u.role = 'STUDENT'
            u.email = s['email']
            u.first_name = s['first_name']
            u.last_name = s['last_name']
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
            sp.register_number = s['reg_no']
            sp.department = 'Information Technology'
            sp.course = 'B.Tech Information Technology'
            sp.year = s['year']
            sp.section = s['section']
            sp.phone = s['phone']
            sp.date_of_birth = s['dob']
            sp.address = s['address']
            sp.save()
            student_profiles[s['username']] = (sp, s['present_rate'])

        self.stdout.write(f"Configured {len(student_profiles)} student profiles.")

        # -------------------------------------------------------------
        # 3. ACADEMIC SUBJECTS & CURRICULUM
        # -------------------------------------------------------------
        subjects = [
            {'code': 'IT3501', 'name': 'Full Stack Web Development', 'faculty': 'Prof. A. Sridhar', 'room': 'Lab 3'},
            {'code': 'IT3502', 'name': 'Database Management Systems', 'faculty': 'Dr. M. Chitra', 'room': 'Room 402'},
            {'code': 'IT3503', 'name': 'Computer Networks & Cloud Computing', 'faculty': 'Dr. R. Ramanathan', 'room': 'Room 405'},
            {'code': 'IT3504', 'name': 'Design and Analysis of Algorithms', 'faculty': 'Prof. V. Rajesh', 'room': 'Room 301'},
            {'code': 'IT3505', 'name': 'Artificial Intelligence & Machine Learning', 'faculty': 'Dr. S. Priya', 'room': 'Lab 1'}
        ]

        # -------------------------------------------------------------
        # 4. ATTENDANCE RECORDS (10 dates x 5 subjects = 50 classes)
        # -------------------------------------------------------------
        today = datetime.date.today()
        dates = []
        d = today - datetime.timedelta(days=25)
        while len(dates) < 10 and d <= today:
            if d.weekday() < 5:  # Monday to Friday
                dates.append(d)
            d += datetime.timedelta(days=1)

        attendance_count = 0
        for username, (sp, present_rate) in student_profiles.items():
            for idx, date_obj in enumerate(dates):
                for period_idx, subj in enumerate(subjects, 1):
                    # Deterministic pseudo-random pattern based on hash
                    val = (hash((username, subj['code'], str(date_obj), period_idx)) % 100) / 100.0
                    if val < present_rate:
                        status = 'PRESENT'
                    elif val < present_rate + 0.05:
                        status = 'OD'
                    elif val < present_rate + 0.08:
                        status = 'LATE'
                    else:
                        status = 'ABSENT'

                    att, created = Attendance.objects.get_or_create(
                        student=sp,
                        subject_code=subj['code'],
                        date=date_obj,
                        period=f"Period {period_idx}",
                        defaults={
                            'subject_name': subj['name'],
                            'status': status,
                            'marked_by': primary_hod
                        }
                    )
                    if not created and att.status != status:
                        att.status = status
                        att.save()
                    attendance_count += 1

        self.stdout.write(f"Populated {attendance_count} attendance records.")

        # -------------------------------------------------------------
        # 5. WEEKLY TIMETABLE SLOTS
        # -------------------------------------------------------------
        timetable_matrix = [
            # Day, Period, Start, End, Subject Code
            ('MON', 1, '09:00', '09:50', 'IT3501'),
            ('MON', 2, '09:50', '10:40', 'IT3502'),
            ('MON', 3, '10:55', '11:45', 'IT3503'),
            ('MON', 4, '11:45', '12:35', 'IT3504'),
            ('MON', 5, '01:30', '02:20', 'IT3505'),

            ('TUE', 1, '09:00', '09:50', 'IT3503'),
            ('TUE', 2, '09:50', '10:40', 'IT3501'),
            ('TUE', 3, '10:55', '11:45', 'IT3505'),
            ('TUE', 4, '11:45', '12:35', 'IT3502'),
            ('TUE', 5, '01:30', '02:20', 'IT3504'),

            ('WED', 1, '09:00', '09:50', 'IT3504'),
            ('WED', 2, '09:50', '10:40', 'IT3505'),
            ('WED', 3, '10:55', '11:45', 'IT3501'),
            ('WED', 4, '11:45', '12:35', 'IT3503'),
            ('WED', 5, '01:30', '02:20', 'IT3502'),

            ('THU', 1, '09:00', '09:50', 'IT3502'),
            ('THU', 2, '09:50', '10:40', 'IT3504'),
            ('THU', 3, '10:55', '11:45', 'IT3503'),
            ('THU', 4, '11:45', '12:35', 'IT3505'),
            ('THU', 5, '01:30', '02:20', 'IT3501'),

            ('FRI', 1, '09:00', '09:50', 'IT3505'),
            ('FRI', 2, '09:50', '10:40', 'IT3503'),
            ('FRI', 3, '10:55', '11:45', 'IT3502'),
            ('FRI', 4, '11:45', '12:35', 'IT3501'),
            ('FRI', 5, '01:30', '02:20', 'IT3504'),
        ]

        subj_lookup = {s['code']: s for s in subjects}
        for sec in ['B', 'A']:
            for entry in timetable_matrix:
                day, period, start, end, code = entry
                meta = subj_lookup[code]
                TimetableSlot.objects.get_or_create(
                    department='Information Technology',
                    year=3,
                    section=sec,
                    day=day,
                    period_number=period,
                    defaults={
                        'start_time': datetime.time.fromisoformat(start),
                        'end_time': datetime.time.fromisoformat(end),
                        'subject_code': code,
                        'subject_name': meta['name'],
                        'faculty_name': meta['faculty'],
                        'room': meta['room']
                    }
                )

        self.stdout.write("Configured weekly timetable schedule.")

        # -------------------------------------------------------------
        # 6. ANNOUNCEMENTS & CIRCULARS
        # -------------------------------------------------------------
        announcements_data = [
            {
                'title': 'Continuous Assessment Test II (CAT-2) Schedule',
                'message': 'CAT-2 examinations for 3rd Year B.Tech IT commence next Monday. Hall tickets and seating arrangements will be verified in respective examination blocks.',
                'audience': 'DEPARTMENT',
                'priority': 'URGENT',
                'department': 'Information Technology',
                'year': 3,
                'section': ''
            },
            {
                'title': 'Guest Lecture on Cloud Native Computing & Kubernetes Architecture',
                'message': 'Department of IT organizes an executive tech session by Lead Cloud Architect, AWS. Attendance is mandatory for all 3rd and 4th year students.',
                'audience': 'DEPARTMENT',
                'priority': 'IMPORTANT',
                'department': 'Information Technology',
                'year': 3,
                'section': ''
            },
            {
                'title': 'National Level Smart India Hackathon — Internal Screening',
                'message': 'Teams submitting project proposals for the Smart India Hackathon internal screening must register their problem statements before Friday 5:00 PM.',
                'audience': 'ALL',
                'priority': 'NORMAL',
                'department': 'Information Technology',
                'year': None,
                'section': ''
            },
            {
                'title': 'End-Semester Mini-Project Phase-1 Code Review Notice',
                'message': 'Phase-1 repository commits and architectural design diagrams will be reviewed by department evaluation panels in Lab 3.',
                'audience': 'DEPARTMENT',
                'priority': 'IMPORTANT',
                'department': 'Information Technology',
                'year': 3,
                'section': 'B'
            }
        ]

        for a in announcements_data:
            Announcement.objects.get_or_create(
                title=a['title'],
                defaults={
                    'author': primary_hod,
                    'message': a['message'],
                    'audience': a['audience'],
                    'priority': a['priority'],
                    'department': a['department'],
                    'year': a['year'],
                    'section': a['section']
                }
            )

        self.stdout.write("Configured departmental announcements.")

        # -------------------------------------------------------------
        # 7. ASSIGNMENTS & STUDENT SUBMISSIONS
        # -------------------------------------------------------------
        assignments_data = [
            {
                'title': 'REST API Implementation with Token Authentication',
                'description': 'Build production-ready CRUD endpoints in Django REST Framework with role-based permissions and comprehensive pytest coverage.',
                'subject_code': 'IT3501',
                'subject_name': 'Full Stack Web Development',
                'due_date': today + datetime.timedelta(days=7),
                'max_score': 50
            },
            {
                'title': 'Database Schema Design & Query Optimization Case Study',
                'description': 'Design 3NF relational schemas for high-concurrency systems. Include EXPLAIN ANALYZE execution plans and indexing strategies.',
                'subject_code': 'IT3502',
                'subject_name': 'Database Management Systems',
                'due_date': today + datetime.timedelta(days=12),
                'max_score': 50
            },
            {
                'title': 'Packet Analysis & TCP Flow Control Lab Report',
                'description': 'Capture network packets using Wireshark, analyze the three-way handshake, congestion windows, and TLS 1.3 key exchange.',
                'subject_code': 'IT3503',
                'subject_name': 'Computer Networks & Cloud Computing',
                'due_date': today + datetime.timedelta(days=15),
                'max_score': 50
            },
            {
                'title': 'Dynamic Programming & Greedy Algorithms Benchmark',
                'description': 'Implement 0/1 Knapsack and Dijkstra shortest path algorithms, measuring asymptotic complexity against empirical execution time.',
                'subject_code': 'IT3504',
                'subject_name': 'Design and Analysis of Algorithms',
                'due_date': today + datetime.timedelta(days=20),
                'max_score': 50
            }
        ]

        assignments_created = []
        for a in assignments_data:
            obj, _ = Assignment.objects.get_or_create(
                title=a['title'],
                department='Information Technology',
                year=3,
                defaults={
                    'created_by': primary_hod,
                    'description': a['description'],
                    'subject_code': a['subject_code'],
                    'subject_name': a['subject_name'],
                    'section': '',
                    'due_date': a['due_date'],
                    'max_score': a['max_score']
                }
            )
            assignments_created.append(obj)

        # Create submissions for students
        alex_sp, _ = student_profiles['25IT104']
        priya_sp, _ = student_profiles['25IT105']
        aarav_sp, _ = student_profiles['25IT101']

        # Alex has 1 graded, 1 submitted, 2 pending
        AssignmentSubmission.objects.get_or_create(
            assignment=assignments_created[0],
            student=alex_sp,
            defaults={
                'notes': 'Completed all DRF endpoints with 100% test coverage and Swagger documentation.',
                'status': 'GRADED',
                'score': 48,
                'feedback': 'Outstanding submission! Clean architecture and excellent API error handling.',
                'graded_at': datetime.datetime.now(datetime.timezone.utc)
            }
        )

        AssignmentSubmission.objects.get_or_create(
            assignment=assignments_created[1],
            student=alex_sp,
            defaults={
                'notes': 'Submitted database schema with B-Tree indexing benchmarks.',
                'status': 'SUBMITTED'
            }
        )

        # Priya has 1 graded, 1 submitted
        AssignmentSubmission.objects.get_or_create(
            assignment=assignments_created[0],
            student=priya_sp,
            defaults={
                'notes': 'All API endpoints implemented and verified.',
                'status': 'GRADED',
                'score': 45,
                'feedback': 'Good work on authentication middleware. Consider adding pagination.',
                'graded_at': datetime.datetime.now(datetime.timezone.utc)
            }
        )

        # Aarav has 1 graded
        AssignmentSubmission.objects.get_or_create(
            assignment=assignments_created[0],
            student=aarav_sp,
            defaults={
                'notes': 'REST API implementation complete.',
                'status': 'GRADED',
                'score': 49,
                'feedback': 'Flawless execution.',
                'graded_at': datetime.datetime.now(datetime.timezone.utc)
            }
        )

        self.stdout.write("Configured assignments and student submissions.")

        # -------------------------------------------------------------
        # 8. STUDY MATERIALS
        # -------------------------------------------------------------
        materials_data = [
            {
                'title': 'Unit 1: Modern Web Architecture & RESTful API Best Practices',
                'description': 'Comprehensive lecture notes covering HTTP protocol, stateless authentication, DRF serializers, and OpenAPI schemas.',
                'subject_code': 'IT3501',
                'subject_name': 'Full Stack Web Development',
                'file_size': '2.4 MB'
            },
            {
                'title': 'Unit 2: Relational Query Optimization, B-Trees & Index Tuning',
                'description': 'Deep dive into query execution plans, hash joins, clustering, and ACID transaction isolation levels.',
                'subject_code': 'IT3502',
                'subject_name': 'Database Management Systems',
                'file_size': '3.1 MB'
            },
            {
                'title': 'Unit 3: Cloud Native Infrastructure, Containers & Microservices',
                'description': 'Architectural breakdown of Docker containerization, Kubernetes pods, ingress controllers, and CDN caching.',
                'subject_code': 'IT3503',
                'subject_name': 'Computer Networks & Cloud Computing',
                'file_size': '4.8 MB'
            },
            {
                'title': 'Unit 4: Advanced Dynamic Programming & Amortized Analysis',
                'description': 'Optimal substructure theorems, memoization patterns, and potential methods in algorithmic complexity.',
                'subject_code': 'IT3504',
                'subject_name': 'Design and Analysis of Algorithms',
                'file_size': '1.9 MB'
            },
            {
                'title': 'Unit 5: Deep Learning Foundations, CNNs & Transformer Models',
                'description': 'Backpropagation mathematics, attention mechanisms, loss functions, and practical transfer learning.',
                'subject_code': 'IT3505',
                'subject_name': 'Artificial Intelligence & Machine Learning',
                'file_size': '5.2 MB'
            }
        ]

        for m in materials_data:
            StudyMaterial.objects.get_or_create(
                title=m['title'],
                department='Information Technology',
                year=3,
                defaults={
                    'uploaded_by': primary_hod,
                    'description': m['description'],
                    'subject_code': m['subject_code'],
                    'subject_name': m['subject_name'],
                    'section': '',
                    'file_size': m['file_size']
                }
            )

        self.stdout.write("Configured course study materials.")

        # -------------------------------------------------------------
        # 9. STUDENT DOCUMENTS & REVIEWS
        # -------------------------------------------------------------
        documents_data = [
            {
                'student': alex_sp,
                'title': 'College ID Card (Issued 2024-2028)',
                'doc_type': 'ID',
                'status': 'APPROVED',
                'comments': 'Verified by HOD Office. Academic identity confirmed.'
            },
            {
                'student': alex_sp,
                'title': 'Semester 4 Official Grade Sheet',
                'doc_type': 'MARKSHEET',
                'status': 'APPROVED',
                'comments': 'All credits verified. CGPA 8.92 confirmed.'
            },
            {
                'student': alex_sp,
                'title': 'National Hackathon Merit Certificate',
                'doc_type': 'CERTIFICATE',
                'status': 'APPROVED',
                'comments': 'Approved for inclusion in departmental honors record.'
            },
            {
                'student': priya_sp,
                'title': 'College ID Card',
                'doc_type': 'ID',
                'status': 'APPROVED',
                'comments': 'Verified.'
            },
            {
                'student': priya_sp,
                'title': 'Semester 4 Marksheet',
                'doc_type': 'MARKSHEET',
                'status': 'PENDING',
                'comments': ''
            },
            {
                'student': aarav_sp,
                'title': 'Community Certificate',
                'doc_type': 'COMMUNITY',
                'status': 'APPROVED',
                'comments': 'Verified with government register.'
            }
        ]

        for d_info in documents_data:
            doc, created = Document.objects.get_or_create(
                student=d_info['student'],
                title=d_info['title'],
                defaults={
                    'document_type': d_info['doc_type'],
                    'status': d_info['status'],
                    'reviewer_comments': d_info['comments']
                }
            )
            if d_info['status'] == 'APPROVED':
                DocumentReview.objects.get_or_create(
                    document=doc,
                    reviewer=primary_hod,
                    defaults={
                        'status': 'APPROVED',
                        'comments': d_info['comments']
                    }
                )

        self.stdout.write("Configured student document records & verification.")

        # -------------------------------------------------------------
        # 10. LEAVE & OD APPLICATIONS
        # -------------------------------------------------------------
        leave_data = [
            {
                'student': alex_sp,
                'leave_type': 'On Duty (OD)',
                'reason': 'Representing college at Smart India Hackathon Grand Finale at IIT Madras.',
                'from_date': today + datetime.timedelta(days=3),
                'to_date': today + datetime.timedelta(days=5),
                'status': 'APPROVED',
                'hod_comments': 'Recommended and approved. Good luck representing the department!'
            },
            {
                'student': alex_sp,
                'leave_type': 'Medical Leave',
                'reason': 'Viral fever and prescribed medical rest.',
                'from_date': today - datetime.timedelta(days=12),
                'to_date': today - datetime.timedelta(days=10),
                'status': 'APPROVED',
                'hod_comments': 'Medical certificate verified and approved.'
            },
            {
                'student': priya_sp,
                'leave_type': 'Casual Leave',
                'reason': 'Family wedding ceremony.',
                'from_date': today + datetime.timedelta(days=2),
                'to_date': today + datetime.timedelta(days=3),
                'status': 'PENDING',
                'hod_comments': ''
            },
            {
                'student': aarav_sp,
                'leave_type': 'On Duty (OD)',
                'reason': 'Paper presentation at IEEE International Conference.',
                'from_date': today + datetime.timedelta(days=8),
                'to_date': today + datetime.timedelta(days=9),
                'status': 'PENDING',
                'hod_comments': ''
            },
            {
                'student': student_profiles['25IT106'][0],
                'leave_type': 'Casual Leave',
                'reason': 'Personal travel.',
                'from_date': today - datetime.timedelta(days=5),
                'to_date': today - datetime.timedelta(days=4),
                'status': 'REJECTED',
                'hod_comments': 'Attendance is currently below the mandatory 75% threshold. Please attend classes.'
            }
        ]

        for l in leave_data:
            LeaveRequest.objects.get_or_create(
                student=l['student'],
                from_date=l['from_date'],
                to_date=l['to_date'],
                defaults={
                    'leave_type': l['leave_type'],
                    'reason': l['reason'],
                    'status': l['status'],
                    'hod_comments': l['hod_comments'],
                    'reviewed_by': primary_hod if l['status'] != 'PENDING' else None,
                    'reviewed_at': datetime.datetime.now(datetime.timezone.utc) if l['status'] != 'PENDING' else None
                }
            )

        self.stdout.write("Configured leave and on-duty requests.")

        # -------------------------------------------------------------
        # 11. INTERNAL MARKS
        # -------------------------------------------------------------
        marks_matrix = [
            # (student, subject_code, subject_name, exam_type, score, max_score)
            (alex_sp, 'IT3501', 'Full Stack Web Development', 'CAT1', 46.50, 50),
            (alex_sp, 'IT3501', 'Full Stack Web Development', 'CAT2', 48.00, 50),
            (alex_sp, 'IT3502', 'Database Management Systems', 'CAT1', 44.00, 50),
            (alex_sp, 'IT3502', 'Database Management Systems', 'CAT2', 45.50, 50),
            (alex_sp, 'IT3503', 'Computer Networks & Cloud Computing', 'CAT1', 42.00, 50),
            (alex_sp, 'IT3503', 'Computer Networks & Cloud Computing', 'CAT2', 47.00, 50),
            (alex_sp, 'IT3504', 'Design and Analysis of Algorithms', 'CAT1', 43.50, 50),
            (alex_sp, 'IT3504', 'Design and Analysis of Algorithms', 'CAT2', 46.00, 50),
            (alex_sp, 'IT3505', 'Artificial Intelligence & Machine Learning', 'CAT1', 45.00, 50),
            (alex_sp, 'IT3505', 'Artificial Intelligence & Machine Learning', 'CAT2', 49.00, 50),

            (priya_sp, 'IT3501', 'Full Stack Web Development', 'CAT1', 42.00, 50),
            (priya_sp, 'IT3502', 'Database Management Systems', 'CAT1', 40.50, 50),
            (priya_sp, 'IT3503', 'Computer Networks & Cloud Computing', 'CAT1', 38.00, 50),

            (aarav_sp, 'IT3501', 'Full Stack Web Development', 'CAT1', 48.00, 50),
            (aarav_sp, 'IT3502', 'Database Management Systems', 'CAT1', 47.50, 50),
        ]

        for m in marks_matrix:
            sp, code, name, exam, score, max_score = m
            InternalMark.objects.get_or_create(
                student=sp,
                subject_code=code,
                exam_type=exam,
                semester=5,
                defaults={
                    'subject_name': name,
                    'score': score,
                    'max_score': max_score,
                    'academic_year': '2026-27',
                    'entered_by': primary_hod
                }
            )

        self.stdout.write("Configured internal examination marks.")

        # -------------------------------------------------------------
        # 12. NOTIFICATIONS
        # -------------------------------------------------------------
        notifs_data = [
            {
                'recipient': alex_sp.user,
                'title': 'OD Application Approved',
                'message': 'Your On Duty application for Smart India Hackathon at IIT Madras has been approved by HOD.',
                'notif_type': 'LEAVE'
            },
            {
                'recipient': alex_sp.user,
                'title': 'New Course Material Uploaded',
                'message': 'Unit 3 Cloud Native Infrastructure notes published in Computer Networks.',
                'notif_type': 'INFO'
            },
            {
                'recipient': alex_sp.user,
                'title': 'Assignment 1 Graded',
                'message': 'Your REST API Implementation assignment was graded: 48/50. View feedback in coursework.',
                'notif_type': 'ASSIGNMENT'
            },
            {
                'recipient': primary_hod,
                'title': 'New Leave Application Received',
                'message': 'Priya Sharma (25IT105) applied for Casual Leave on upcoming dates.',
                'notif_type': 'LEAVE'
            },
            {
                'recipient': demo_hod,
                'title': 'Welcome to ACADEX HOD Command Center',
                'message': 'Your executive department dashboard is active with live analytics for Information Technology.',
                'notif_type': 'INFO'
            }
        ]

        for n in notifs_data:
            Notification.objects.get_or_create(
                recipient=n['recipient'],
                title=n['title'],
                defaults={
                    'message': n['message'],
                    'notif_type': n['notif_type'],
                    'is_read': False
                }
            )

        self.stdout.write("Configured notification alerts.")

        # -------------------------------------------------------------
        # 13. AUDIT LOGS
        # -------------------------------------------------------------
        AuditLog.objects.create(
            user=primary_hod,
            action='Database Seed Completed',
            description='Populated 15 student profiles, weekly timetables, attendance, course materials, assignments and marks.'
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all ACADEX demonstration records.'))
