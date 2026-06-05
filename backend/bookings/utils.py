from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
import io


def generate_ticket_pdf(booking):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Header
    p.setFillColorRGB(0.1, 0.3, 0.7)
    p.rect(0, height - 100, width, 100, fill=True, stroke=False)
    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica-Bold", 28)
    p.drawString(50, height - 55, "BusGo")
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, "Your Journey, Our Responsibility")

    # Booking ID
    p.setFillColorRGB(0, 0, 0)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 140, f"Booking ID: {booking.booking_id}")

    # Route Info
    p.setFont("Helvetica-Bold", 14)
    source = booking.trip.schedule.route.source
    dest = booking.trip.schedule.route.destination
    p.drawString(50, height - 180, f"{source}  →  {dest}")

    # Details
    p.setFont("Helvetica", 12)
    details = [
        ("Passenger Name", booking.passenger_name),
        ("Travel Date", str(booking.trip.trip_date)),
        ("Departure Time", str(booking.trip.schedule.departure_time)),
        ("Arrival Time", str(booking.trip.schedule.arrival_time)),
        ("Seat Number", booking.seat.seat_number),
        ("Bus Name", booking.trip.schedule.bus.bus_name),
        ("Bus Type", booking.trip.schedule.bus.get_bus_type_display()),
        ("Fare Paid", f"₹{booking.fare_paid}"),
        ("Status", booking.status),
    ]

    y = height - 220
    for label, value in details:
        p.setFillColorRGB(0.5, 0.5, 0.5)
        p.drawString(50, y, f"{label}:")
        p.setFillColorRGB(0, 0, 0)
        p.drawString(250, y, str(value))
        y -= 25

    # Footer
    p.setFillColorRGB(0.9, 0.9, 0.9)
    p.rect(0, 0, width, 60, fill=True, stroke=False)
    p.setFillColorRGB(0.3, 0.3, 0.3)
    p.setFont("Helvetica", 10)
    p.drawString(50, 35, "Thank you for choosing BusGo! Have a safe journey.")
    p.drawString(50, 20, "For support: support@busgo.com | +91 1800-XXX-XXXX")

    p.showPage()
    p.save()
    buffer.seek(0)

    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="ticket_{booking.booking_id}.pdf"'
    return response
