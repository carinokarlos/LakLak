# Phase 1 - Local MVP

Phase 1 establishes the local booking loop for Laklak:

- Node.js API project under `/api`
- React operations UI under `/client`
- XAMPP MariaDB/MySQL schema in `database.sql`
- Seed data in `seed.sql`
- Local email-only dashboard login
- Admin analytics, users, clubs, tables, and reservations
- User-style reservation creation
- Admin reservation confirmation and cancellation
- Manual check-in from confirmed QR hashes

For full setup and run instructions, use the root `README.md`.

## Local Database

Create or import the `nightclub_booking` database through phpMyAdmin, then import:

1. `database.sql`
2. `seed.sql`

Default local connection:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=nightclub_booking
DB_USER=root
DB_PASSWORD=
```

## Main Local URLs

- React app served by API: `http://127.0.0.1:8000`
- Vite dev server: `http://127.0.0.1:5173`
- API route index: `http://127.0.0.1:8000/api`
- API health: `http://127.0.0.1:8000/health`
- Database health: `http://127.0.0.1:8000/db/health`

## Test Login

```txt
admin@laklak.local
developer@laklak.local
staffadmin@laklak.local
clubadmin@laklak.local
```

Passwords are not used in Phase 1.
