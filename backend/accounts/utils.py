from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


def send_welcome_email(user):
    try:
        subject = 'Welcome to BusGo!'
        html_message = render_to_string('emails/welcome.html', {'user': user})
        send_mail(subject, '', settings.DEFAULT_FROM_EMAIL,
                  [user.email], html_message=html_message, fail_silently=True)
    except Exception:
        pass


def send_booking_confirmation_email(booking):
    try:
        subject = f'Booking Confirmed - {booking.booking_id}'
        html_message = render_to_string('emails/booking_confirmation.html', {'booking': booking})
        send_mail(subject, '', settings.DEFAULT_FROM_EMAIL,
                  [booking.user.email], html_message=html_message, fail_silently=True)
    except Exception:
        pass


def send_cancellation_email(booking):
    try:
        subject = f'Booking Cancelled - {booking.booking_id}'
        html_message = render_to_string('emails/cancellation.html', {'booking': booking})
        send_mail(subject, '', settings.DEFAULT_FROM_EMAIL,
                  [booking.user.email], html_message=html_message, fail_silently=True)
    except Exception:
        pass
