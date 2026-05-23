import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Landing from "./components/views/Landing";
import Login from "./components/views/Login";
import AdminDashboard from "./components/views/AdminDashboard";
import UserView from "./components/views/UserView";
import Checkin from "./components/views/Checkin";
import { EmptyState } from "./components/ui/EmptyState";
import { formatRole, formatCurrency, formatDate, formatDateInput, truncateHash } from "./utils/helpers";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const SESSION_KEY = "laklak.currentUser";
const ROUTES = {
  landing: "/",
  login: "/login",
  admin: "/app/admin",
  user: "/app/user",
  checkin: "/app/checkin",
};
const ROUTE_VIEWS = {
  [ROUTES.admin]: "admin",
  [ROUTES.user]: "user",
  [ROUTES.checkin]: "checkin",
};
const VIEW_ROUTES = {
  admin: ROUTES.admin,
  user: ROUTES.user,
  checkin: ROUTES.checkin,
};
const PRIVATE_ROUTES = new Set([ROUTES.admin, ROUTES.user, ROUTES.checkin]);
const ADMIN_ROLES = new Set(["admin", "super_admin", "developer", "staff_admin", "club_admin"]);

function normalizePath(path) {
  return path.replace(/\/+$/, "") || ROUTES.landing;
}

function getRouteForRole(user) {
  if (!user) return ROUTES.login;
  if (ADMIN_ROLES.has(user.role)) return ROUTES.admin;
  if (user.role === "user") return ROUTES.user;
  return ROUTES.login;
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem(SESSION_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });
  const [routePath, setRoutePath] = useState(() => normalizePath(window.location.pathname));
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
  const currentView = ROUTE_VIEWS[routePath] || "admin";

  const navigate = useCallback((path, options = {}) => {
    const nextPath = normalizePath(path);
    const historyMethod = options.replace ? "replaceState" : "pushState";

    if (window.location.pathname !== nextPath) {
      window.history[historyMethod]({}, "", nextPath);
    }

    setRoutePath(nextPath);
  }, []);

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

  useEffect(() => {
    const handlePopState = () => {
      setRoutePath(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let nextPath = null;

    if (!currentUser && PRIVATE_ROUTES.has(routePath)) {
      nextPath = ROUTES.login;
    } else if (currentUser && routePath === ROUTES.login) {
      nextPath = getRouteForRole(currentUser);
    } else if (currentUser && routePath === ROUTES.admin && !ADMIN_ROLES.has(currentUser.role)) {
      nextPath = getRouteForRole(currentUser);
    }

    if (nextPath) {
      window.queueMicrotask(() => {
        navigate(nextPath, { replace: true });
      });
    }
  }, [currentUser, navigate, routePath]);

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
  }, [currentUser, selectedAdminClubId, fetchJson, setAdminTables, setTableError]);

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
  }, [currentUser, selectedUserClubId, fetchJson, setUserTables, setUserTableError]);

  async function handleLogin(event) {
    if (event) event.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const { user } = await fetchJson("/auth/dev-login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail.trim() }),
      });

      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setCurrentUser(user);
      navigate(getRouteForRole(user), { replace: true });
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
    navigate(ROUTES.landing, { replace: true });
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

  if (routePath === ROUTES.landing) {
    return (
      <Landing
        currentUser={currentUser}
        onNavigate={navigate}
        getRouteForRole={getRouteForRole}
      />
    );
  }

  if (!currentUser || routePath === ROUTES.login) {
    return (
      <Login
        onLogin={handleLogin}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginError={loginError}
        isLoggingIn={isLoggingIn}
      />
    );
  }

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

  return (
    <div className="app-shell">
      <Sidebar
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={(view) => navigate(VIEW_ROUTES[view] || ROUTES.admin)}
      />

      <main className="workspace">
        <Topbar
          pageCopy={pageCopy}
          currentUser={currentUser}
          formatRole={formatRole}
          isRefreshing={isRefreshing}
          loadDashboard={loadDashboard}
          handleLogout={handleLogout}
        />

        {loadError && <EmptyState tone="error">{loadError}</EmptyState>}

        {currentView === "admin" && (
          <AdminDashboard
            currentUser={currentUser}
            loadDashboard={loadDashboard}
            isRefreshing={isRefreshing}
            dashboardLoaded={dashboardLoaded}
            loadError={loadError}
            systemStatus={systemStatus}
            clubs={clubs}
            analytics={analytics}
            reservations={reservations}
            users={users}
            selectedAdminClubId={selectedAdminClubId}
            setSelectedAdminClubId={setSelectedAdminClubId}
            selectedAdminClub={selectedAdminClub}
            adminTables={adminTables}
            tableError={tableError}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            truncateHash={truncateHash}
            handleReservationAction={handleReservationAction}
            activeReservationAction={activeReservationAction}
          />
        )}

        {currentView === "user" && (
          <UserView
            currentUser={currentUser}
            loadDashboard={loadDashboard}
            isRefreshing={isRefreshing}
            dashboardLoaded={dashboardLoaded}
            loadError={loadError}
            clubs={clubs}
            setSelectedUserClubId={setSelectedUserClubId}
            selectedUserClubId={selectedUserClubId}
            selectedUserClub={selectedUserClub}
            userTables={userTables}
            userTableError={userTableError}
            bookingForm={bookingForm}
            setBookingForm={setBookingForm}
            selectedBookingTable={selectedBookingTable}
            setSelectedBookingTable={setSelectedBookingTable}
            bookingMessage={bookingMessage}
            setBookingMessage={setBookingMessage}
            isBooking={isBooking}
            handleBookingSubmit={handleBookingSubmit}
            formatDateInput={formatDateInput}
          />
        )}

        {currentView === "checkin" && (
          <Checkin
            currentUser={currentUser}
            loadDashboard={loadDashboard}
            isRefreshing={isRefreshing}
            dashboardLoaded={dashboardLoaded}
            loadError={loadError}
            checkinHash={checkinHash}
            setCheckinHash={setCheckinHash}
            checkinMessage={checkinMessage}
            setCheckinMessage={setCheckinMessage}
            isCheckingIn={isCheckingIn}
            handleCheckin={handleCheckin}
            formatDate={formatDate}
          />
        )}
      </main>
    </div>
  );
}

export default App;
