import os
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django.setup()

try:
    from django.core.management import call_command
    call_command('migrate', '--run-syncdb', verbosity=0)
except Exception as e:
    print(f"Migration error: {e}")

try:
    call_command('collectstatic', '--noinput', verbosity=0)
except Exception as e:
    print(f"Collectstatic error: {e}")

try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(email='admin@busgo.com').exists():
        User.objects.create_superuser(
            email='admin@busgo.com',
            username='admin',
            password='Admin@123',
            first_name='Admin',
            last_name='BusGo'
        )
except Exception as e:
    print(f"Superuser error: {e}")

application = get_wsgi_application()