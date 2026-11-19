from rest_framework import permissions


class IsHOD(permissions.BasePermission):
    """
    Allows access only to HOD users (or administrators).
    """
    message = "Access restricted to Head of Department (HOD) only."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.role == 'HOD' or
            request.user.is_superuser or
            request.user.is_staff or
            hasattr(request.user, 'hod_profile')
        )


class IsStudent(permissions.BasePermission):
    """
    Allows access only to verified Student users.
    """
    message = "Access restricted to Students only."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role == 'STUDENT' or hasattr(request.user, 'student_profile')


class IsOwnerOrHOD(permissions.BasePermission):
    """
    Object-level permission to only allow students to view/edit their own data,
    while allowing HODs full access to review.
    """
    def has_object_permission(self, request, view, obj):
        # Read/Write permissions are allowed to HOD
        if (
            request.user.role == 'HOD' or
            request.user.is_superuser or
            request.user.is_staff
        ):
            return True

        # Check if object is student-related
        if hasattr(obj, 'student'):
            return obj.student.user == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
