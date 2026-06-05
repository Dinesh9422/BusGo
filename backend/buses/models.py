from django.db import models


class BusOperator(models.Model):
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='operators/', blank=True, null=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Route(models.Model):
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    distance_km = models.FloatField(default=0)
    estimated_duration = models.CharField(max_length=50)

    class Meta:
        unique_together = ['source', 'destination']

    def __str__(self):
        return f"{self.source} → {self.destination}"


class Bus(models.Model):
    BUS_TYPES = [
        ('AC_SEATER', 'AC Seater'),
        ('NON_AC_SEATER', 'Non-AC Seater'),
        ('AC_SLEEPER', 'AC Sleeper'),
        ('NON_AC_SLEEPER', 'Non-AC Sleeper'),
        ('LUXURY', 'Luxury'),
        ('VOLVO', 'Volvo'),
    ]
    operator = models.ForeignKey(BusOperator, on_delete=models.CASCADE, related_name='buses')
    bus_number = models.CharField(max_length=20, unique=True)
    bus_name = models.CharField(max_length=200)
    bus_type = models.CharField(max_length=20, choices=BUS_TYPES)
    total_seats = models.PositiveIntegerField(default=40)
    amenities = models.JSONField(default=list)  # ['WiFi', 'AC', 'USB Charging', 'Water Bottle']
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.bus_name} ({self.bus_number})"


class Schedule(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='schedules')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='schedules')
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    fare = models.DecimalField(max_digits=10, decimal_places=2)
    days_of_week = models.JSONField(default=list)  # ['MON', 'TUE', ...]
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.bus.bus_name} | {self.route} | {self.departure_time}"


class Trip(models.Model):
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='trips')
    trip_date = models.DateField()
    available_seats = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['schedule', 'trip_date']

    def __str__(self):
        return f"{self.schedule.bus.bus_name} on {self.trip_date}"


class Seat(models.Model):
    SEAT_TYPES = [('WINDOW', 'Window'), ('AISLE', 'Aisle'), ('MIDDLE', 'Middle')]
    DECK_CHOICES = [('LOWER', 'Lower'), ('UPPER', 'Upper')]
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    seat_type = models.CharField(max_length=10, choices=SEAT_TYPES, default='AISLE')
    deck = models.CharField(max_length=10, choices=DECK_CHOICES, default='LOWER')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['bus', 'seat_number']

    def __str__(self):
        return f"Seat {self.seat_number} - {self.bus.bus_name}"
