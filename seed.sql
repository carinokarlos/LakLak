USE nightclub_booking;

SET @club_bgc = UUID();
SET @club_pobla = UUID();
SET @super_admin = UUID();
SET @developer = UUID();
SET @staff_admin = UUID();
SET @club_admin = UUID();
SET @user = UUID();

INSERT INTO clubs (id, name, location, description)
VALUES
  (
    @club_bgc,
    'Laklak BGC',
    'Bonifacio Global City, Taguig',
    'High-energy club with premium bottle service and private tables.'
  ),
  (
    @club_pobla,
    'Laklak Pobla',
    'Poblacion, Makati',
    'Compact nightlife room for birthdays, barkada nights, and walk-ins.'
  );

INSERT INTO users (id, firebase_uid, name, email, role, club_id)
VALUES
  (
    @super_admin,
    'seed-super-admin-firebase-uid',
    'Laklak Superadmin',
    'admin@laklak.local',
    'super_admin',
    NULL
  ),
  (
    @developer,
    'seed-developer-firebase-uid',
    'Laklak Developer',
    'developer@laklak.local',
    'developer',
    NULL
  ),
  (
    @staff_admin,
    'seed-staff-admin-firebase-uid',
    'BGC Staff Admin',
    'staffadmin@laklak.local',
    'staff_admin',
    @club_bgc
  ),
  (
    @club_admin,
    'seed-club-admin-firebase-uid',
    'Pobla Club Admin',
    'clubadmin@laklak.local',
    'club_admin',
    @club_pobla
  ),
  (
    @user,
    'seed-user-firebase-uid',
    'Laklak User',
    'user@laklak.local',
    'user',
    NULL
  );

INSERT INTO tables (id, club_id, label, capacity, min_consumable)
VALUES
  (UUID(), @club_bgc, 'Table A1', 4, 5000.00),
  (UUID(), @club_bgc, 'Table A2', 4, 5000.00),
  (UUID(), @club_bgc, 'Table B1', 6, 8000.00),
  (UUID(), @club_bgc, 'VIP 1', 8, 15000.00),
  (UUID(), @club_bgc, 'VIP 2', 10, 20000.00),
  (UUID(), @club_pobla, 'Booth 1', 4, 3500.00),
  (UUID(), @club_pobla, 'Booth 2', 4, 3500.00),
  (UUID(), @club_pobla, 'Booth 3', 6, 6000.00),
  (UUID(), @club_pobla, 'Lounge 1', 8, 10000.00),
  (UUID(), @club_pobla, 'Lounge 2', 8, 10000.00);
