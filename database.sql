-- ============================================================
--  Nightclub Booking SaaS — MySQL Schema
--  Compatible with: XAMPP (local dev) → Supabase/AWS RDS (prod)
--  To migrate later: dump data, swap DATABASE_URL, re-run
-- ============================================================

CREATE DATABASE IF NOT EXISTS nightclub_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nightclub_booking;

-- ============================================================
--  CLUBS
--  Added: is_active, updated_at, description now nullable
-- ============================================================
CREATE TABLE IF NOT EXISTS clubs (
  id              CHAR(36)        PRIMARY KEY,
  name            VARCHAR(255)    NOT NULL,
  location        VARCHAR(255)    NOT NULL,
  description     TEXT            NULL,                          -- nullable: not required at creation
  cover_image_url VARCHAR(1024)   NULL,
  is_active       BOOLEAN         NOT NULL DEFAULT TRUE,         -- soft-delete instead of hard delete
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  USERS
--  Roles: super_admin, developer, staff_admin, club_admin, user
--  club_id is nullable — only staff/admins are tied to a club
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36)     PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  role         ENUM('super_admin','developer','staff_admin','club_admin','user')
                            NOT NULL DEFAULT 'user',
  club_id      CHAR(36)     NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_club_id
    FOREIGN KEY (club_id) REFERENCES clubs(id)
    ON DELETE SET NULL                                           -- user survives club deletion
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  TABLES
--  Added: updated_at
-- ============================================================
CREATE TABLE IF NOT EXISTS tables (
  id             CHAR(36)       PRIMARY KEY,
  club_id        CHAR(36)       NOT NULL,
  label          VARCHAR(80)    NOT NULL,
  capacity       INT            NOT NULL,
  min_consumable DECIMAL(12, 2) NOT NULL,
  is_active      BOOLEAN        NOT NULL DEFAULT TRUE,
  updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tables_club_id
    FOREIGN KEY (club_id) REFERENCES clubs(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  RESERVATIONS
--  Fixed: user_id ON DELETE → SET NULL (preserve history)
--  Added: updated_at (track when status changed)
--  added: guest_count (how many people for the table)
--  added: notes (special requests from customer)
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id            CHAR(36)   PRIMARY KEY,
  user_id       CHAR(36)   NULL,                                -- NULL if user account deleted (history preserved)
  table_id      CHAR(36)   NOT NULL,
  booking_date  DATE       NOT NULL,
  guest_count   INT        NOT NULL DEFAULT 1,                  -- how many guests
  notes         TEXT       NULL,                                -- special requests, e.g. "anniversary setup"
  status        ENUM('pending','confirmed','attended','cancelled')
                           NOT NULL DEFAULT 'pending',
  qr_code_hash  VARCHAR(255) NULL UNIQUE,                       -- HMAC-signed, single-use
  expires_at    TIMESTAMP  NULL,                                -- pending lock expires after 10 min
  scanned_at    TIMESTAMP  NULL,                                -- set when QR is scanned by staff
  scanned_by    CHAR(36)   NULL,                                -- FK to users (staff member)
  created_at    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservations_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,                                         -- FIXED: was CASCADE, history now preserved
  CONSTRAINT fk_reservations_table_id
    FOREIGN KEY (table_id) REFERENCES tables(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reservations_scanned_by
    FOREIGN KEY (scanned_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  PAYMENTS  (stub — gateway wired in Phase 5)
--  Added: paid_at, payment_method
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id               CHAR(36)       PRIMARY KEY,
  reservation_id   CHAR(36)       NOT NULL UNIQUE,
  amount           DECIMAL(12, 2) NOT NULL,
  status           ENUM('unpaid','paid','refunded','failed')
                                  NOT NULL DEFAULT 'unpaid',    -- added refunded + failed for Phase 5
  payment_method   ENUM('gcash','maya','card','cash','other')
                                  NULL,                         -- NULL until payment is made
  reference_number VARCHAR(255)   NULL,                         -- filled by gateway in Phase 5
  paid_at          TIMESTAMP      NULL,                         -- set when status → paid
  created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_reservation_id
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  AUDIT LOGS
--  Records every important action: who did what, to which record, when.
--  Written by the API on every state-changing operation.
--  Never deleted — append only.
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          CHAR(36)     PRIMARY KEY,
  actor_id    CHAR(36)     NULL,                                -- user who performed the action (NULL = system)
  actor_role  VARCHAR(50)  NULL,                                -- role snapshot at time of action
  action      VARCHAR(100) NOT NULL,                            -- e.g. RESERVATION_CREATED, STATUS_CHANGED, QR_SCANNED
  entity      VARCHAR(50)  NOT NULL,                            -- table name: reservations, payments, clubs…
  entity_id   CHAR(36)     NOT NULL,                            -- PK of the affected row
  old_value   JSON         NULL,                                -- state before change (nullable for creates)
  new_value   JSON         NULL,                                -- state after change (nullable for deletes)
  ip_address  VARCHAR(45)  NULL,                                -- IPv4 or IPv6
  user_agent  VARCHAR(500) NULL,                                -- browser/app identifier
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_audit_actor_id   (actor_id),
  INDEX ix_audit_entity     (entity, entity_id),
  INDEX ix_audit_action     (action),
  INDEX ix_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  BACKUP LOGS
--  Records every database backup attempt: manual or scheduled.
--  Use this to verify backups ran and are healthy.
-- ============================================================
CREATE TABLE IF NOT EXISTS backup_logs (
  id             CHAR(36)     PRIMARY KEY,
  triggered_by   CHAR(36)     NULL,                             -- user ID if manual, NULL if scheduled
  trigger_type   ENUM('scheduled','manual')
                              NOT NULL DEFAULT 'scheduled',
  status         ENUM('running','success','failed')
                              NOT NULL DEFAULT 'running',
  file_name      VARCHAR(500) NULL,                             -- backup file name or S3/R2 path
  file_size_kb   BIGINT       NULL,                             -- size of backup file in KB
  storage_target VARCHAR(100) NULL,                             -- e.g. 'local', 's3', 'r2', 'supabase'
  error_message  TEXT         NULL,                             -- filled if status = failed
  started_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    TIMESTAMP    NULL,                             -- NULL while running
  INDEX ix_backup_status     (status),
  INDEX ix_backup_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX ix_clubs_is_active            ON clubs(is_active);
CREATE INDEX ix_tables_club_id             ON tables(club_id);
CREATE INDEX ix_reservations_user_id       ON reservations(user_id);
CREATE INDEX ix_reservations_table_id      ON reservations(table_id);
CREATE INDEX ix_reservations_booking_date  ON reservations(booking_date);
CREATE INDEX ix_reservations_expires_at    ON reservations(expires_at);
CREATE INDEX ix_reservations_status        ON reservations(status);
CREATE INDEX ix_reservations_table_date_status
  ON reservations(table_id, booking_date, status);             -- used by availability query