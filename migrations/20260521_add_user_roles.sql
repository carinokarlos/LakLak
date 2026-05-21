USE nightclub_booking;

ALTER TABLE users
  MODIFY role ENUM(
    'customer',
    'staff',
    'super_admin',
    'developer',
    'staff_admin',
    'club_admin',
    'user'
  ) NOT NULL DEFAULT 'user';

UPDATE users SET role = 'user' WHERE role = 'customer';
UPDATE users SET role = 'staff_admin' WHERE role = 'staff';
UPDATE users SET role = 'super_admin' WHERE email = 'admin@laklak.local';

ALTER TABLE users
  MODIFY role ENUM(
    'super_admin',
    'developer',
    'staff_admin',
    'club_admin',
    'user'
  ) NOT NULL DEFAULT 'user';

SET @club_bgc = (SELECT id FROM clubs WHERE name = 'Laklak BGC' LIMIT 1);
SET @club_pobla = (SELECT id FROM clubs WHERE name = 'Laklak Pobla' LIMIT 1);

INSERT INTO users (id, firebase_uid, name, email, role, club_id)
SELECT UUID(), 'seed-developer-firebase-uid', 'Laklak Developer', 'developer@laklak.local', 'developer', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'developer@laklak.local');

INSERT INTO users (id, firebase_uid, name, email, role, club_id)
SELECT UUID(), 'seed-staff-admin-firebase-uid', 'BGC Staff Admin', 'staffadmin@laklak.local', 'staff_admin', @club_bgc
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'staffadmin@laklak.local');

INSERT INTO users (id, firebase_uid, name, email, role, club_id)
SELECT UUID(), 'seed-club-admin-firebase-uid', 'Pobla Club Admin', 'clubadmin@laklak.local', 'club_admin', @club_pobla
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'clubadmin@laklak.local');

INSERT INTO users (id, firebase_uid, name, email, role, club_id)
SELECT UUID(), 'seed-user-firebase-uid', 'Laklak User', 'user@laklak.local', 'user', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@laklak.local');
