from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import threading


def send_email_async(subject, html_message, recipient):
    def _send():
        try:
            send_mail(subject, '', settings.DEFAULT_FROM_EMAIL,
                      [recipient], html_message=html_message, fail_silently=True)
        except Exception:
            pass
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def send_welcome_email(user):
    try:
        html_message = render_to_string('emails/welcome.html', {'user': user})
        send_email_async('Welcome to BusGo!', html_message, user.email)
    except Exception:
        pass


def send_booking_confirmation_email(booking):
    try:
        html_message = render_to_string('emails/booking_confirmation.html', {'booking': booking})
        send_email_async(f'Booking Confirmed - {booking.booking_id}', html_message, booking.user.email)
    except Exception:
        pass


def send_cancellation_email(booking):
    try:
        html_message = render_to_string('emails/cancellation.html', {'booking': booking})
        send_email_async(f'Booking Cancelled - {booking.booking_id}', html_message, booking.user.email)
    except Exception:
        pass