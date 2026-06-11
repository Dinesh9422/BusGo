from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from buses.models import BusOperator, Bus, Route, Schedule, Trip, Seat


class Command(BaseCommand):
    help = 'Seed sample data for BusGo'

    def handle(self, *args, **kwargs):
        self.stdout.write('🚌 Seeding BusGo data...')

        # Clear existing data
        Trip.objects.all().delete()
        Schedule.objects.all().delete()
        Seat.objects.all().delete()
        Bus.objects.all().delete()
        Route.objects.all().delete()
        BusOperator.objects.all().delete()

        # ── OPERATORS ──
        tnstc = BusOperator.objects.create(name='TNSTC', is_active=True)
        kpn   = BusOperator.objects.create(name='KPN Travels', is_active=True)
        srs   = BusOperator.objects.create(name='SRS Travels', is_active=True)
        prtc  = BusOperator.objects.create(name='PRTC Travels', is_active=True)
        self.stdout.write('✅ Operators created')

        # ── ROUTES ──
        routes_data = [
            ('Chennai',     'Bangalore',    350, '5h 30m'),
            ('Bangalore',   'Chennai',      350, '5h 30m'),
            ('Chennai',     'Coimbatore',   500, '7h 30m'),
            ('Coimbatore',  'Chennai',      500, '7h 30m'),
            ('Chennai',     'Madurai',      460, '7h'),
            ('Madurai',     'Chennai',      460, '7h'),
            ('Chennai',     'Salem',        340, '5h'),
            ('Salem',       'Chennai',      340, '5h'),
            ('Chennai',     'Trichy',       330, '5h'),
            ('Trichy',      'Chennai',      330, '5h'),
            ('Chennai',     'Pondicherry',  160, '3h'),
            ('Pondicherry', 'Chennai',      160, '3h'),
            ('Coimbatore',  'Bangalore',    360, '6h'),
            ('Bangalore',   'Coimbatore',   360, '6h'),
            ('Salem',       'Coimbatore',   160, '3h'),
            ('Coimbatore',  'Salem',        160, '3h'),
            ('Madurai',     'Coimbatore',   220, '4h'),
            ('Coimbatore',  'Madurai',      220, '4h'),
            ('Salem',       'Bangalore',    260, '4h 30m'),
            ('Bangalore',   'Salem',        260, '4h 30m'),
            ('Chennai',     'Hyderabad',    630, '10h'),
            ('Hyderabad',   'Chennai',      630, '10h'),
            ('Trichy',      'Madurai',      140, '2h 30m'),
            ('Madurai',     'Trichy',       140, '2h 30m'),
        ]
        routes = {}
        for src, dst, dist, dur in routes_data:
            r = Route.objects.create(
                source=src, destination=dst,
                distance_km=dist, estimated_duration=dur
            )
            routes[f'{src}-{dst}'] = r
        self.stdout.write(f'✅ {len(routes)} Routes created')

        # ── BUSES ──
        days_all = ["MON","TUE","WED","THU","FRI","SAT","SUN"]

        buses_data = [
            ('Chennai Express',    'TN01AB1234', 'AC_SEATER',     40, tnstc, ["AC","USB Charging","Water Bottle"]),
            ('KPN Deluxe',         'TN02CD5678', 'NON_AC_SEATER', 45, kpn,   ["Water Bottle"]),
            ('SRS Sleeper',        'TN03EF9012', 'AC_SLEEPER',    36, srs,   ["AC","Blanket","Pillow","USB Charging"]),
            ('Night Rider',        'TN04GH3456', 'VOLVO',         40, kpn,   ["AC","WiFi","USB Charging","Water Bottle"]),
            ('Tamil Nadu Express', 'TN05IJ7890', 'AC_SEATER',     40, tnstc, ["AC","USB Charging"]),
            ('Coimbatore King',    'TN06KL2345', 'VOLVO',         40, kpn,   ["AC","WiFi","USB Charging"]),
            ('Madurai Rocket',     'TN07MN6789', 'NON_AC_SEATER', 45, srs,   ["Water Bottle"]),
            ('Salem Star',         'TN08OP1234', 'AC_SLEEPER',    36, tnstc, ["AC","Blanket","Pillow"]),
            ('Pondy Express',      'TN09QR5678', 'AC_SEATER',     40, prtc,  ["AC","USB Charging"]),
            ('Hyderabad King',     'TN10ST9012', 'VOLVO',         44, srs,   ["AC","WiFi","USB Charging","Blanket"]),
        ]

        buses = []
        for name, num, btype, seats, op, amenities in buses_data:
            b = Bus.objects.create(
                bus_name=name, bus_number=num, bus_type=btype,
                total_seats=seats, operator=op, amenities=amenities, is_active=True
            )
            # Generate seats
            seat_count = 0
            while seat_count < seats:
                seat_count += 1
                seat_type = 'WINDOW' if seat_count % 4 in [1, 0] else 'AISLE'
                Seat.objects.create(
                    bus=b, seat_number=str(seat_count),
                    seat_type=seat_type, deck='LOWER'
                )
            buses.append(b)
        self.stdout.write(f'✅ {len(buses)} Buses + Seats created')

        # ── SCHEDULES ──
        b = {b.bus_name: b for b in buses}
        r = routes

        schedules_data = [
            (b['Chennai Express'],    r['Chennai-Bangalore'],   '06:00:00', '11:30:00', 450),
            (b['SRS Sleeper'],        r['Chennai-Bangalore'],   '22:00:00', '03:30:00', 650),
            (b['Tamil Nadu Express'], r['Bangalore-Chennai'],   '06:30:00', '12:00:00', 450),
            (b['Night Rider'],        r['Bangalore-Chennai'],   '21:00:00', '02:30:00', 620),
            (b['Chennai Express'],    r['Chennai-Coimbatore'],  '08:00:00', '15:30:00', 520),
            (b['Coimbatore King'],    r['Coimbatore-Chennai'],  '07:00:00', '14:30:00', 520),
            (b['KPN Deluxe'],         r['Chennai-Madurai'],     '07:00:00', '14:00:00', 380),
            (b['Madurai Rocket'],     r['Madurai-Chennai'],     '06:00:00', '13:00:00', 380),
            (b['Tamil Nadu Express'], r['Chennai-Salem'],       '10:00:00', '15:00:00', 280),
            (b['Salem Star'],         r['Salem-Chennai'],       '09:00:00', '14:00:00', 280),
            (b['Madurai Rocket'],     r['Chennai-Trichy'],      '08:00:00', '13:00:00', 320),
            (b['Tamil Nadu Express'], r['Trichy-Chennai'],      '07:00:00', '12:00:00', 320),
            (b['Pondy Express'],      r['Chennai-Pondicherry'], '09:00:00', '12:00:00', 180),
            (b['Pondy Express'],      r['Pondicherry-Chennai'], '15:00:00', '18:00:00', 180),
            (b['Night Rider'],        r['Coimbatore-Bangalore'],'21:00:00', '03:00:00', 580),
            (b['Coimbatore King'],    r['Bangalore-Coimbatore'],'22:00:00', '04:00:00', 580),
            (b['Salem Star'],         r['Salem-Coimbatore'],    '10:00:00', '13:00:00', 180),
            (b['KPN Deluxe'],         r['Madurai-Coimbatore'],  '08:00:00', '12:00:00', 280),
            (b['Salem Star'],         r['Salem-Bangalore'],     '08:00:00', '12:30:00', 350),
            (b['Hyderabad King'],     r['Chennai-Hyderabad'],   '20:00:00', '06:00:00', 750),
            (b['Hyderabad King'],     r['Hyderabad-Chennai'],   '19:00:00', '05:00:00', 750),
            (b['Madurai Rocket'],     r['Trichy-Madurai'],      '09:00:00', '11:30:00', 180),
            (b['KPN Deluxe'],         r['Coimbatore-Madurai'],  '11:00:00', '15:00:00', 280),
        ]

        schedules = []
        for bus, route, dep, arr, fare in schedules_data:
            s = Schedule.objects.create(
                bus=bus, route=route,
                departure_time=dep, arrival_time=arr,
                fare=fare, days_of_week=days_all, is_active=True
            )
            schedules.append(s)
        self.stdout.write(f'✅ {len(schedules)} Schedules created')

        # ── TRIPS — next 15 days ──
        trip_count = 0
        today = date.today()
        for i in range(1, 16):
            trip_date = today + timedelta(days=i)
            for schedule in schedules:
                Trip.objects.create(
                    schedule=schedule,
                    trip_date=trip_date,
                    available_seats=schedule.bus.total_seats - 2,
                    status='SCHEDULED'
                )
                trip_count += 1

        self.stdout.write(f'✅ {trip_count} Trips created (next 15 days)')
        self.stdout.write('🎉 BusGo seed data complete!')