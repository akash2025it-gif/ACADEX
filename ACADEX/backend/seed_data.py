"""
ACADEX Database Seeding Entry Point
Delegates to the official Django management command seed_acadex_data.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command

def seed_database():
    call_command('seed_acadex_data')

if __name__ == '__main__':
    seed_database()
