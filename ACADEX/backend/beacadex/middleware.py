import os
from django.conf import settings
from django.http import HttpResponse


class CorsMiddleware:
    """
    Production-ready CORS middleware for ACADEX.
    Supports:
    - Custom production frontend origins via settings / CORS_ALLOWED_ORIGINS / FRONTEND_URL
    - Exact origin matching (no unrestricted wildcard in production)
    - Pre-flight OPTIONS handling with caching headers
    """
    def __init__(self, get_response):
        self.get_response = get_response
        allowed_origins_env = os.environ.get('CORS_ALLOWED_ORIGINS') or os.environ.get('FRONTEND_URL', '')
        if allowed_origins_env:
            self.allowed_origins = [o.strip() for o in allowed_origins_env.split(',') if o.strip()]
        else:
            self.allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', ['https://acadex-portal.vercel.app'])

    def __call__(self, request):
        if request.method == 'OPTIONS':
            response = HttpResponse()
            self._add_cors_headers(request, response)
            return response

        response = self.get_response(request)
        self._add_cors_headers(request, response)
        return response

    def _add_cors_headers(self, request, response):
        origin = request.headers.get('Origin', '')

        if '*' in self.allowed_origins:
            response['Access-Control-Allow-Origin'] = '*'
        elif origin in self.allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
        elif not origin and self.allowed_origins:
            response['Access-Control-Allow-Origin'] = self.allowed_origins[0]

        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-CSRFToken, Accept, Origin, X-Requested-With'
        response['Access-Control-Max-Age'] = '86400'
