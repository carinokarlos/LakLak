import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const SESSION_KEY = "laklak.currentUser";

const ROLE_LABELS = {
  super_admin: "Superadmin",
  developer: "Developer",
  staff_admin: "Staff Admin",
  club_admin: "Club Admin",
  user: "User",
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function formatRole(role, roleLabel) {
  return roleLabel || ROLE_LABELS[role] || role;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function truncateHash(value) {
  return value ? `${value.slice(0, 16)}...` : "-";
}

function getStoredUser() {
  const storedUser = localStorage.getItem(SESSION_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark" aria-hidden="true">
        L
      </div>
      <div>
        <strong>Laklak</strong>
        <span>Operations</span>
      </div>
    </div>
  );
}

function StatTile({ label, value, tone = "default" }) {
  return (
    <div className={classNames("status-tile", tone !== "default" && `status-tile-${tone}`)}>
      <span className="label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ children, tone = "empty" }) {
  return <div className={`${tone}-state`}>{children}</div>;
}

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [currentView, setCurrentView] = useState("admin");
  const [loginEmail, setLoginEmail] = useState("admin@laklak.local");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [clubs, setClubs] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [systemStatus, setSystemStatus] = useState({ api: "Checking", db: "Checking" });

  const [selectedAdminClubId, setSelectedAdminClubId] = useState(null);
  const [selectedUserClubId, setSelectedUserClubId] = useState(null);
  const [adminTables, setAdminTables] = useState([]);
  const [userTables, setUserTables] = useState([]);
  const [tableError, setTableError] = useState("");
  const [userTableError, setUserTableError] = useState("");

  const [selectedBookingTable, setSelectedBookingTable] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    customerName: "Juan Dela Cruz",
    customerEmail: "guest@laklak.local",
    bookingDate: formatDateInput(),
  });
  const [bookingMessage, setBookingMessage] = useState({ text: "", type: "" });
  const [isBooking, setIsBooking] = useState(false);

  const [checkinHash, setCheckinHash] = useState("");
  const [checkinMessage, setCheckinMessage] = useState({ text: "", type: "" });
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [activeReservationAction, setActiveReservationAction] = useState("");

  const selectedAdminClub = useMemo(
    () => clubs.find((club) => club.id === selectedAdminClubId),
    [clubs, selectedAdminClubId]
  );
  const selectedUserClub = useMemo(
    () => clubs.find((club) => club.id === selectedUserClubId),
    [clubs, selectedUserClubId]
  );

  const pageCopy = {
    admin: {
      title: "Admin Dashboard",
      subtitle: "Live local operations data from XAMPP and the Node API.",
    },
    user: {
      title: "User View",
      subtitle: "Customer-facing club and table browsing.",
    },
    checkin: {
      title: "Door Check-in",
      subtitle: "Validate confirmed QR hashes at the entrance.",
    },
  }[currentView];

  const fetchJson = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.error || `${path} returned ${response.status}`);
    }

    return body;
  }, []);

  const loadDashboard = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError("");

    try {
      const [health, dbHealth, clubsData, analyticsData, reservationsData, usersData] =
        await Promise.all([
          fetchJson("/health"),
          fetchJson("/db/health"),
          fetchJson("/clubs"),
          fetchJson("/admin/analytics"),
          fetchJson("/admin/reservations"),
          fetchJson("/admin/users"),
        ]);

      setSystemStatus({ api: health.status.toUpperCase(), db: dbHealth.database });
      setClubs(clubsData);
      setAnalytics(analyticsData);
      setReservations(reservationsData);
      setUsers(usersData);
      setSelectedAdminClubId((currentId) =>
        currentId && clubsData.some((club) => club.id === currentId)
          ? currentId
          : clubsData[0]?.id || null
      );
      setSelectedUserClubId((currentId) =>
        currentId && clubsData.some((club) => club.id === currentId)
          ? currentId
          : clubsData[0]?.id || null
      );
      setDashboardLoaded(true);
    } catch (error) {
      setSystemStatus({ api: "Error", db: "Check MySQL" });
      setLoadError(error.message);
      setDashboardLoaded(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchJson]);

  useEffect(() => {
    if (!currentUser) return;

    window.queueMicrotask(() => {
      void loadDashboard();
    });
  }, [currentUser, loadDashboard]);

  useEffect(() => {
    if (!currentUser) return undefined;

    const pollingTimer = window.setInterval(() => {
      if (currentView === "admin") {
        void loadDashboard();
      }
    }, 30000);

    return () => window.clearInterval(pollingTimer);
  }, [currentUser, currentView, loadDashboard]);

  useEffect(() => {
    if (!currentUser || !selectedAdminClubId) {
      return undefined;
    }

    let ignore = false;
    fetchJson(`/clubs/${selectedAdminClubId}/tables`)
      .then((tables) => {
        if (!ignore) {
          setTableError("");
          setAdminTables(tables);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setAdminTables([]);
          setTableError(error.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentUser, selectedAdminClubId, fetchJson]);

  useEffect(() => {
    if (!currentUser || !selectedUserClubId) {
      return undefined;
    }

    let ignore = false;
    fetchJson(`/clubs/${selectedUserClubId}/tables`)
      .then((tables) => {
        if (!ignore) {
          setUserTableError("");
          setUserTables(tables);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setUserTables([]);
          setUserTableError(error.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentUser, selectedUserClubId, fetchJson]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const { user } = await fetchJson("/auth/dev-login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail.trim() }),
      });

      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setDashboardLoaded(false);
    setLoadError("");
    setSelectedBookingTable(null);
    setBookingMessage({ text: "", type: "" });
    setCheckinMessage({ text: "", type: "" });
  }

  async function handleReservationAction(reservationId, action) {
    if (action === "cancel") {
      const confirmed = window.confirm("Cancel this reservation?");
      if (!confirmed) return;
    }

    setActiveReservationAction(`${reservationId}:${action}`);

    try {
      await fetchJson(`/admin/reservations/${reservationId}/${action}`, { method: "PATCH" });
      await loadDashboard();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setActiveReservationAction("");
    }
  }

  async function handleBookingSubmit(event) {
    event.preventDefault();
    setBookingMessage({ text: "", type: "" });

    if (!selectedBookingTable) {
      setBookingMessage({ text: "Select a table first.", type: "error" });
      return;
    }

    setIsBooking(true);

    try {
      const reservation = await fetchJson("/reservations", {
        method: "POST",
        body: JSON.stringify({
          customer_name: bookingForm.customerName.trim(),
          customer_email: bookingForm.customerEmail.trim(),
          booking_date: bookingForm.bookingDate,
          table_id: selectedBookingTable.id,
        }),
      });

      setBookingMessage({
        text: `Reservation ${reservation.status}. Admin can now confirm it.`,
        type: "success",
      });
      await loadDashboard();
    } catch (error) {
      setBookingMessage({ text: error.message, type: "error" });
    } finally {
      setIsBooking(false);
    }
  }

  async function handleCheckin(event) {
    event.preventDefault();
    setCheckinMessage({ text: "", type: "" });
    setIsCheckingIn(true);

    try {
      const result = await fetchJson("/checkin", {
        method: "POST",
        body: JSON.stringify({ qr_code_hash: checkinHash.trim() }),
      });

      setCheckinMessage({
        text: `${result.customer_name} checked in for ${result.club_name} ${result.table_label}.`,
        type: "success",
      });
      setCheckinHash("");
      await loadDashboard();
    } catch (error) {
      setCheckinMessage({ text: error.message, type: "error" });
    } finally {
      setIsCheckingIn(false);
    }
  }

  if (!currentUser) {
    return (
      <section className="login-screen">
        <form className="login-panel" onSubmit={handleLogin}>
          <div className="login-brand">
            <Brand />
          </div>

          <div>
            <h1>Sign In</h1>
            <p className="login-copy">Use your local admin account.</p>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={loginEmail}
              autoComplete="email"
              onChange={(event) => setLoginEmail(event.target.value)}
              required
            />
          </label>

          <button className="button" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Signing in" : "Continue"}
          </button>
          <p className="form-message error" role="status">
            {loginError}
          </p>
        </form>
      </section>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />

        <nav className="nav-list" aria-label="Main navigation">
          <button
            className={classNames("nav-item", currentView === "admin" && "active")}
            type="button"
            onClick={() => setCurrentView("admin")}
          >
            Admin Dashboard
          </button>
          <button
            className={classNames("nav-item", currentView === "user" && "active")}
            type="button"
            onClick={() => setCurrentView("user")}
          >
            User View
          </button>
          <button
            className={classNames("nav-item", currentView === "checkin" && "active")}
            type="button"
            onClick={() => setCurrentView("checkin")}
          >
            Check-in
          </button>
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <div className="user-badge">
              {currentUser.name} ({formatRole(currentUser.role, currentUser.role_label)})
            </div>
            <button className="button" type="button" onClick={() => void loadDashboard()}>
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
            <button className="button button-secondary" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {loadError && <EmptyState tone="error">{loadError}</EmptyState>}

        {currentView === "admin" && (
          <section className="view-panel">
            <section className="status-grid" aria-label="System status">
              <StatTile label="API" value={systemStatus.api} tone={loadError ? "danger" : "ok"} />
              <StatTile label="Database" value={systemStatus.db} tone={loadError ? "danger" : "ok"} />
              <StatTile label="Clubs" value={analytics?.clubs || 0} />
              <StatTile label="Tables" value={analytics?.tables || 0} />
            </section>

            <section className="status-grid" aria-label="Reservation analytics">
              <StatTile label="Reservations" value={analytics?.reservations.total || 0} />
              <StatTile label="Pending" value={analytics?.reservations.pending || 0} />
              <StatTile label="Confirmed" value={analytics?.reservations.confirmed || 0} />
              <StatTile label="Attended" value={analytics?.reservations.attended || 0} />
            </section>

            <section className="content-grid">
              <section className="panel" aria-labelledby="clubsHeading">
                <div className="panel-header">
                  <div>
                    <h2 id="clubsHeading">Club Inventory</h2>
                    <p>Select a club to inspect tables.</p>
                  </div>
                  <span className="timestamp">
                    {dashboardLoaded ? `Loaded ${new Date().toLocaleTimeString("en-PH")}` : "Loading"}
                  </span>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.length === 0 ? (
                        <tr>
                          <td colSpan="3">No clubs found. Import seed.sql in phpMyAdmin.</td>
                        </tr>
                      ) : (
                        clubs.map((club) => (
                          <tr
                            key={club.id}
                            className={classNames("clickable", club.id === selectedAdminClubId && "selected")}
                            onClick={() => setSelectedAdminClubId(club.id)}
                          >
                            <td>
                              <strong>{club.name}</strong>
                              <div className="table-meta">{club.description}</div>
                            </td>
                            <td>{club.location}</td>
                            <td>{formatDate(club.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel" aria-labelledby="tablesHeading">
                <div className="panel-header">
                  <div>
                    <h2 id="tablesHeading">Tables</h2>
                    <p>
                      {selectedAdminClub
                        ? `${selectedAdminClub.name} - ${selectedAdminClub.location}`
                        : "No club selected."}
                    </p>
                  </div>
                </div>

                <div className="tables-list">
                  {tableError && <EmptyState tone="error">{tableError}</EmptyState>}
                  {!tableError && adminTables.length === 0 && (
                    <EmptyState>No tables found for this club.</EmptyState>
                  )}
                  {adminTables.map((table) => (
                    <article className="table-row" key={table.id}>
                      <div>
                        <strong>{table.label}</strong>
                        <div className="table-meta">
                          {table.capacity} guests - {formatCurrency(table.min_consumable)} min consumable
                        </div>
                      </div>
                      <span className={classNames("badge", !table.is_active && "offline")}>
                        {table.is_active ? "Active" : "Inactive"}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            </section>

            <section className="panel users-panel" aria-labelledby="usersHeading">
              <div className="panel-header">
                <div>
                  <h2 id="usersHeading">User Roles</h2>
                  <p>Local access levels for Phase 1 testing.</p>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Club</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4">No users found. Import seed.sql or run the role migration.</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.name}</strong>
                            <div className="table-meta">{user.email}</div>
                          </td>
                          <td>
                            <span className="badge">{formatRole(user.role, user.role_label)}</span>
                          </td>
                          <td>{user.club_name || "All clubs"}</td>
                          <td>{formatDate(user.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel reservations-panel" aria-labelledby="reservationsHeading">
              <div className="panel-header">
                <div>
                  <h2 id="reservationsHeading">Latest Reservations</h2>
                  <p>Newest reservation requests and confirmations.</p>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Club</th>
                      <th>Table</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>QR Hash</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.length === 0 ? (
                      <tr>
                        <td colSpan="7">No reservations yet.</td>
                      </tr>
                    ) : (
                      reservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td>
                            <strong>{reservation.customer_name}</strong>
                            <div className="table-meta">{reservation.customer_email}</div>
                          </td>
                          <td>{reservation.club_name}</td>
                          <td>{reservation.table_label}</td>
                          <td>{formatDate(reservation.booking_date)}</td>
                          <td>
                            <span className={`badge status-${reservation.status}`}>{reservation.status}</span>
                          </td>
                          <td>
                            <code className="qr-hash">{truncateHash(reservation.qr_code_hash)}</code>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="button button-compact"
                                type="button"
                                disabled={
                                  reservation.status !== "pending" ||
                                  activeReservationAction === `${reservation.id}:confirm`
                                }
                                onClick={() => void handleReservationAction(reservation.id, "confirm")}
                              >
                                Confirm
                              </button>
                              <button
                                className="button button-secondary button-compact"
                                type="button"
                                disabled={
                                  ["cancelled", "attended"].includes(reservation.status) ||
                                  activeReservationAction === `${reservation.id}:cancel`
                                }
                                onClick={() => void handleReservationAction(reservation.id, "cancel")}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {currentView === "user" && (
          <section className="view-panel">
            <section className="user-grid">
              <section className="panel" aria-labelledby="userClubsHeading">
                <div className="panel-header">
                  <div>
                    <h2 id="userClubsHeading">Browse Clubs</h2>
                    <p>Customer preview for choosing a venue.</p>
                  </div>
                </div>

                <div className="user-card-list">
                  {clubs.length === 0 && <EmptyState>No clubs available.</EmptyState>}
                  {clubs.map((club) => (
                    <button
                      className={classNames("club-card", club.id === selectedUserClubId && "selected")}
                      key={club.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserClubId(club.id);
                        setSelectedBookingTable(null);
                        setBookingMessage({ text: "", type: "" });
                      }}
                    >
                      <span className="club-card-title">{club.name}</span>
                      <span>{club.location}</span>
                      <small>{club.description}</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel" aria-labelledby="userTablesHeading">
                <div className="panel-header">
                  <div>
                    <h2 id="userTablesHeading">Available Tables</h2>
                    <p>
                      {selectedUserClub
                        ? `${selectedUserClub.name} - ${selectedUserClub.location}`
                        : "Select a club to view tables."}
                    </p>
                  </div>
                </div>

                <div className="booking-list">
                  {userTableError && <EmptyState tone="error">{userTableError}</EmptyState>}
                  {!userTableError && userTables.length === 0 && <EmptyState>No tables available.</EmptyState>}
                  {userTables.map((table) => (
                    <article className="booking-row" key={table.id}>
                      <div>
                        <strong>{table.label}</strong>
                        <div className="table-meta">
                          Seats {table.capacity} - {formatCurrency(table.min_consumable)}
                        </div>
                      </div>
                      <button
                        className="button button-secondary reserve-button"
                        type="button"
                        disabled={!table.is_active}
                        onClick={() => {
                          setSelectedBookingTable(table);
                          setBookingMessage({ text: "", type: "" });
                        }}
                      >
                        Reserve
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            </section>

            <section className="panel booking-panel" aria-labelledby="bookingHeading">
              <div className="panel-header">
                <div>
                  <h2 id="bookingHeading">Create Reservation</h2>
                  <p>
                    {selectedBookingTable
                      ? `${selectedBookingTable.label} - ${formatCurrency(
                          selectedBookingTable.min_consumable
                        )} min consumable`
                      : "No table selected."}
                  </p>
                </div>
              </div>

              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <label className="field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={bookingForm.customerName}
                    autoComplete="name"
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, customerName: event.target.value }))
                    }
                    required
                  />
                </label>

                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={bookingForm.customerEmail}
                    autoComplete="email"
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, customerEmail: event.target.value }))
                    }
                    required
                  />
                </label>

                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={bookingForm.bookingDate}
                    min={formatDateInput()}
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, bookingDate: event.target.value }))
                    }
                    required
                  />
                </label>

                <button className="button" type="submit" disabled={isBooking}>
                  {isBooking ? "Creating" : "Create Pending Reservation"}
                </button>
                <p className={classNames("form-message", bookingMessage.type)} role="status">
                  {bookingMessage.text}
                </p>
              </form>
            </section>
          </section>
        )}

        {currentView === "checkin" && (
          <section className="view-panel">
            <section className="panel" aria-labelledby="checkinHeading">
              <div className="panel-header">
                <div>
                  <h2 id="checkinHeading">Manual Check-in</h2>
                  <p>Enter the guest's confirmed QR ticket hash.</p>
                </div>
              </div>

              <form className="booking-form checkin-form" onSubmit={handleCheckin}>
                <label className="field checkin-field">
                  <span>QR Code Hash</span>
                  <input
                    type="text"
                    value={checkinHash}
                    placeholder="e.g. abc123def456"
                    autoComplete="off"
                    onChange={(event) => setCheckinHash(event.target.value)}
                    required
                  />
                </label>

                <button className="button" type="submit" disabled={isCheckingIn}>
                  {isCheckingIn ? "Verifying" : "Verify and Admit Guest"}
                </button>
                <p className={classNames("form-message", checkinMessage.type)} role="status">
                  {checkinMessage.text}
                </p>
              </form>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
