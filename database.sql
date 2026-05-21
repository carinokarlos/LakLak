CREATE DATABASE IF NOT EXISTS nightclub_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nightclub_booking;

CREATE TABLE IF NOT EXISTS clubs (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cover_image_url VARCHAR(1024) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('super_admin', 'developer', 'staff_admin', 'club_admin', 'user') NOT NULL DEFAULT 'user',
  club_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_club_id
    FOREIGN KEY (club_id) REFERENCES clubs(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tables (
  id CHAR(36) PRIMARY KEY,
  club_id CHAR(36) NOT NULL,
  label VARCHAR(80) NOT NULL,
  capacity INT NOT NULL,
  min_consumable DECIMAL(12, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_tables_club_id
    FOREIGN KEY (club_id) REFERENCES clubs(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  table_id CHAR(36) NOT NULL,
  booking_date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'attended', 'cancelled') NOT NULL DEFAULT 'pending',
  qr_code_hash VARCHAR(255) NULL,
  expires_at TIMESTAMP NULL,
  scanned_at TIMESTAMP NULL,
  scanned_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservations_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reservations_table_id
    FOREIGN KEY (table_id) REFERENCES tables(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reservations_scanned_by
    FOREIGN KEY (scanned_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY,
  reservation_id CHAR(36) NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
  reference_number VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_reservation_id
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_tables_club_id ON tables(club_id);
CREATE INDEX ix_reservations_user_id ON reservations(user_id);
CREATE INDEX ix_reservations_table_id ON reservations(table_id);
CREATE INDEX ix_reservations_booking_date ON reservations(booking_date);
CREATE INDEX ix_reservations_expires_at ON reservations(expires_at);
CREATE INDEX ix_reservations_status ON reservations(status);
CREATE INDEX ix_reservations_table_date_status
  ON reservations(table_id, booking_date, status);
