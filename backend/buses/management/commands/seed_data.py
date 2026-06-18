from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from buses.models import BusOperator, Bus, Route, Schedule, Trip, Seat


class Command(BaseCommand):
    help = 'Seed sample data for BusGo'

    def handle(self, *args, **kwargs):
        self.stdout.write('🚌 Seeding BusGo data...')

        # Clear existing
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
        svkdt = BusOperator.objects.create(name='SVKDT Travels', is_active=True)
        self.stdout.write('✅ 5 Operators created')

        # ── ROUTES ──
        routes_raw = [
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
            ('Chennai',     'Vellore',      140, '2h 30m'),
            ('Vellore',     'Chennai',      140, '2h 30m'),
            ('Chennai',     'Tirunelveli',  580, '9h'),
            ('Tirunelveli', 'Chennai',      580, '9h'),
            ('Chennai',     'Hyderabad',    630, '10h'),
            ('Hyderabad',   'Chennai',      630, '10h'),
            ('Coimbatore',  'Bangalore',    360, '6h'),
            ('Bangalore',   'Coimbatore',   360, '6h'),
            ('Coimbatore',  'Madurai',      220, '4h'),
            ('Madurai',     'Coimbatore',   220, '4h'),
            ('Salem',       'Coimbatore',   160, '3h'),
            ('Coimbatore',  'Salem',        160, '3h'),
            ('Salem',       'Bangalore',    260, '4h 30m'),
            ('Bangalore',   'Salem',        260, '4h 30m'),
            ('Madurai',     'Trichy',       140, '2h 30m'),
            ('Trichy',      'Madurai',      140, '2h 30m'),
            ('Trichy',      'Coimbatore',   200, '3h 30m'),
            ('Coimbatore',  'Trichy',       200, '3h 30m'),
            ('Salem',       'Madurai',      280, '4h 30m'),
            ('Madurai',     'Salem',        280, '4h 30m'),
        ]
        routes = {}
        for src, dst, dist, dur in routes_raw:
            r = Route.objects.create(
                source=src, destination=dst,
                distance_km=dist, estimated_duration=dur
            )
            routes[f'{src}-{dst}'] = r
        self.stdout.write(f'✅ {len(routes)} Routes created')

        # ── BUSES ──
        buses_raw = [
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
            ('Vellore Vayu',       'TN11UV3456', 'AC_SEATER',     40, svkdt, ["AC","USB Charging","Water Bottle"]),
            ('Tirunelveli Star',   'TN12WX7890', 'NON_AC_SLEEPER',40, prtc,  ["Blanket","Water Bottle"]),
            ('KPN Super',          'TN13YZ1234', 'LUXURY',        32, kpn,   ["AC","WiFi","USB Charging","Water Bottle","Blanket"]),
            ('SRS Ultra',          'TN14AB5678', 'AC_SLEEPER',    36, srs,   ["AC","Blanket","Pillow","USB Charging","Water Bottle"]),
            ('SVKDT Express',      'TN15CD9012', 'NON_AC_SEATER', 45, svkdt, ["Water Bottle"]),
        ]

        bus_objs = {}
        for name, num, btype, seats, op, amenities in buses_raw:
            b = Bus.objects.create(
                bus_name=name, bus_number=num, bus_type=btype,
                total_seats=seats, operator=op, amenities=amenities, is_active=True
            )
            # Generate seats
            for i in range(1, seats + 1):
                seat_type = 'WINDOW' if i % 4 in [1, 0] else 'AISLE'
                Seat.objects.create(
                    bus=b, seat_number=str(i),
                    seat_type=seat_type, deck='LOWER'
                )
            bus_objs[name] = b
        self.stdout.write(f'✅ {len(bus_objs)} Buses + Seats created')

        # ── SCHEDULES ──
        days = ["MON","TUE","WED","THU","FRI","SAT","SUN"]
        r = routes
        b = bus_objs

        schedules_raw = [
            # Chennai ↔ Bangalore
            (b['Chennai Express'],    r['Chennai-Bangalore'],    '06:00:00', '11:30:00', 450),
            (b['Tamil Nadu Express'], r['Chennai-Bangalore'],    '14:00:00', '19:30:00', 420),
            (b['SRS Sleeper'],        r['Chennai-Bangalore'],    '22:00:00', '03:30:00', 650),
            (b['KPN Super'],          r['Chennai-Bangalore'],    '23:30:00', '05:00:00', 850),
            (b['Tamil Nadu Express'], r['Bangalore-Chennai'],    '06:30:00', '12:00:00', 450),
            (b['Night Rider'],        r['Bangalore-Chennai'],    '21:00:00', '02:30:00', 620),
            (b['SRS Ultra'],          r['Bangalore-Chennai'],    '22:30:00', '04:00:00', 680),

            # Chennai ↔ Coimbatore
            (b['Chennai Express'],    r['Chennai-Coimbatore'],   '08:00:00', '15:30:00', 520),
            (b['Coimbatore King'],    r['Chennai-Coimbatore'],   '21:00:00', '04:30:00', 600),
            (b['KPN Deluxe'],         r['Chennai-Coimbatore'],   '22:30:00', '06:00:00', 480),
            (b['Coimbatore King'],    r['Coimbatore-Chennai'],   '07:00:00', '14:30:00', 520),
            (b['Night Rider'],        r['Coimbatore-Chennai'],   '22:00:00', '05:30:00', 580),

            # Chennai ↔ Madurai
            (b['KPN Deluxe'],         r['Chennai-Madurai'],      '07:00:00', '14:00:00', 380),
            (b['Madurai Rocket'],     r['Chennai-Madurai'],      '22:00:00', '05:00:00', 480),
            (b['SVKDT Express'],      r['Chennai-Madurai'],      '09:00:00', '16:00:00', 350),
            (b['Madurai Rocket'],     r['Madurai-Chennai'],      '06:00:00', '13:00:00', 380),
            (b['SRS Sleeper'],        r['Madurai-Chennai'],      '21:30:00', '04:30:00', 500),

            # Chennai ↔ Salem
            (b['Tamil Nadu Express'], r['Chennai-Salem'],        '10:00:00', '15:00:00', 280),
            (b['Salem Star'],         r['Chennai-Salem'],        '06:30:00', '11:30:00', 300),
            (b['Salem Star'],         r['Salem-Chennai'],        '09:00:00', '14:00:00', 280),
            (b['SVKDT Express'],      r['Salem-Chennai'],        '16:00:00', '21:00:00', 260),

            # Chennai ↔ Trichy
            (b['Madurai Rocket'],     r['Chennai-Trichy'],       '08:00:00', '13:00:00', 320),
            (b['KPN Deluxe'],         r['Chennai-Trichy'],       '22:00:00', '03:00:00', 420),
            (b['Tamil Nadu Express'], r['Trichy-Chennai'],       '07:00:00', '12:00:00', 320),

            # Chennai ↔ Pondicherry
            (b['Pondy Express'],      r['Chennai-Pondicherry'],  '09:00:00', '12:00:00', 180),
            (b['Pondy Express'],      r['Chennai-Pondicherry'],  '15:00:00', '18:00:00', 160),
            (b['Pondy Express'],      r['Pondicherry-Chennai'],  '07:00:00', '10:00:00', 180),
            (b['Pondy Express'],      r['Pondicherry-Chennai'],  '18:00:00', '21:00:00', 160),

            # Chennai ↔ Vellore
            (b['Vellore Vayu'],       r['Chennai-Vellore'],      '07:00:00', '09:30:00', 150),
            (b['Vellore Vayu'],       r['Chennai-Vellore'],      '13:00:00', '15:30:00', 140),
            (b['Vellore Vayu'],       r['Vellore-Chennai'],      '06:00:00', '08:30:00', 150),
            (b['Vellore Vayu'],       r['Vellore-Chennai'],      '17:00:00', '19:30:00', 140),

            # Chennai ↔ Tirunelveli
            (b['Tirunelveli Star'],   r['Chennai-Tirunelveli'],  '21:00:00', '06:00:00', 550),
            (b['SRS Ultra'],          r['Chennai-Tirunelveli'],  '22:30:00', '07:30:00', 620),
            (b['Tirunelveli Star'],   r['Tirunelveli-Chennai'],  '20:00:00', '05:00:00', 550),

            # Chennai ↔ Hyderabad
            (b['Hyderabad King'],     r['Chennai-Hyderabad'],    '20:00:00', '06:00:00', 750),
            (b['KPN Super'],          r['Chennai-Hyderabad'],    '21:30:00', '07:30:00', 950),
            (b['Hyderabad King'],     r['Hyderabad-Chennai'],    '19:00:00', '05:00:00', 750),

            # Coimbatore ↔ Bangalore
            (b['Night Rider'],        r['Coimbatore-Bangalore'], '21:00:00', '03:00:00', 580),
            (b['Coimbatore King'],    r['Bangalore-Coimbatore'], '22:00:00', '04:00:00', 580),

            # Salem ↔ Bangalore
            (b['Salem Star'],         r['Salem-Bangalore'],      '08:00:00', '12:30:00', 350),
            (b['SVKDT Express'],      r['Bangalore-Salem'],      '07:00:00', '11:30:00', 350),

            # Salem ↔ Coimbatore
            (b['Salem Star'],         r['Salem-Coimbatore'],     '10:00:00', '13:00:00', 180),
            (b['SVKDT Express'],      r['Coimbatore-Salem'],     '14:00:00', '17:00:00', 180),

            # Madurai ↔ Coimbatore
            (b['KPN Deluxe'],         r['Madurai-Coimbatore'],   '08:00:00', '12:00:00', 280),
            (b['Madurai Rocket'],     r['Coimbatore-Madurai'],   '09:00:00', '13:00:00', 280),

            # Madurai ↔ Trichy
            (b['Madurai Rocket'],     r['Madurai-Trichy'],       '07:00:00', '09:30:00', 180),
            (b['KPN Deluxe'],         r['Trichy-Madurai'],       '10:00:00', '12:30:00', 180),

            # Trichy ↔ Coimbatore
            (b['SVKDT Express'],      r['Trichy-Coimbatore'],    '08:00:00', '11:30:00', 220),
            (b['Madurai Rocket'],     r['Coimbatore-Trichy'],    '12:00:00', '15:30:00', 220),

            # Salem ↔ Madurai
            (b['Salem Star'],         r['Salem-Madurai'],        '07:00:00', '11:30:00', 300),
            (b['SVKDT Express'],      r['Madurai-Salem'],        '08:00:00', '12:30:00', 300),
        ]

        schedule_objs = []
        for bus, route, dep, arr, fare in schedules_raw:
            s = Schedule.objects.create(
                bus=bus, route=route,
                departure_time=dep, arrival_time=arr,
                fare=fare, days_of_week=days, is_active=True
            )
            schedule_objs.append(s)
        self.stdout.write(f'✅ {len(schedule_objs)} Schedules created')

        # ── TRIPS — next 20 days ──
        trip_count = 0
        today = date.today()
        for i in range(1, 21):
            trip_date = today + timedelta(days=i)
            for schedule in schedule_objs:
                Trip.objects.create(
                    schedule=schedule,
                    trip_date=trip_date,
                    available_seats=schedule.bus.total_seats - 2,
                    status='SCHEDULED'
                )
                trip_count += 1

        self.stdout.write(f'✅ {trip_count} Trips created (next 20 days)')
        self.stdout.write('🎉 BusGo seed complete!')
        self.stdout.write(f'   Routes: {len(routes)}')
        self.stdout.write(f'   Buses: {len(bus_objs)}')
        self.stdout.write(f'   Schedules: {len(schedule_objs)}')
        self.stdout.write(f'   Trips: {trip_count}')