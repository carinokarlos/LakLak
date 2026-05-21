const state = {
  clubs: [],
  reservations: [],
  users: [],
  analytics: null,
  selectedAdminClubId: null,
  selectedUserClubId: null,
  currentUser: null,
  currentView: "admin",
};

const elements = {
  loginScreen: document.querySelector("#loginScreen"),
  appShell: document.querySelector("#appShell"),
  loginForm: document.querySelector("#loginForm"),
  emailInput: document.querySelector("#emailInput"),
  loginMessage: document.querySelector("#loginMessage"),
  userBadge: document.querySelector("#userBadge"),
  logoutButton: document.querySelector("#logoutButton"),
  navItems: document.querySelectorAll("[data-view]"),
  pageTitle: document.querySelector("#pageTitle"),
  pageSubtitle: document.querySelector("#pageSubtitle"),
  adminView: document.querySelector("#adminView"),
  userView: document.querySelector("#userView"),
  apiStatus: document.querySelector("#apiStatus"),
  dbStatus: document.querySelector("#dbStatus"),
  clubCount: document.querySelector("#clubCount"),
  tableCount: document.querySelector("#tableCount"),
  reservationCount: document.querySelector("#reservationCount"),
  pendingCount: document.querySelector("#pendingCount"),
  confirmedCount: document.querySelector("#confirmedCount"),
  attendedCount: document.querySelector("#attendedCount"),
  clubsBody: document.querySelector("#clubsBody"),
  tablesList: document.querySelector("#tablesList"),
  selectedClubLabel: document.querySelector("#selectedClubLabel"),
  reservationsBody: document.querySelector("#reservationsBody"),
  usersBody: document.querySelector("#usersBody"),
  userClubList: document.querySelector("#userClubList"),
  userTablesList: document.querySelector("#userTablesList"),
  userSelectedClubLabel: document.querySelector("#userSelectedClubLabel"),
  loadedAt: document.querySelector("#loadedAt"),
  refreshButton: document.querySelector("#refreshButton"),
};

const sessionKey = "laklak.currentUser";
const roleLabels = {
  super_admin: "Superadmin",
  developer: "Developer",
  staff_admin: "Staff Admin",
  club_admin: "Club Admin",
  user: "User",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatRole(role, roleLabel) {
  return roleLabel || roleLabels[role] || role;
}

async function fetchJson(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `${path} returned ${response.status}`);
  }

  return response.json();
}

function setStatus(element, value, isOk = true) {
  element.textContent = value;
  element.style.color = isOk ? "var(--ok-text)" : "var(--danger)";
}

function setView(view) {
  state.currentView = view;
  elements.adminView.classList.toggle("is-hidden", view !== "admin");
  elements.userView.classList.toggle("is-hidden", view !== "user");

  for (const item of elements.navItems) {
    item.classList.toggle("active", item.dataset.view === view);
  }

  if (view === "admin") {
    elements.pageTitle.textContent = "Admin Dashboard";
    elements.pageSubtitle.textContent = "Live local operations data from XAMPP and the Node API.";
    return;
  }

  elements.pageTitle.textContent = "User View";
  elements.pageSubtitle.textContent = "Customer-facing club and table browsing.";
}

function renderAnalytics(analytics) {
  elements.clubCount.textContent = analytics.clubs;
  elements.tableCount.textContent = analytics.tables;
  elements.reservationCount.textContent = analytics.reservations.total;
  elements.pendingCount.textContent = analytics.reservations.pending;
  elements.confirmedCount.textContent = analytics.reservations.confirmed;
  elements.attendedCount.textContent = analytics.reservations.attended;
}

function renderAdminClubs() {
  if (state.clubs.length === 0) {
    elements.clubsBody.innerHTML = `
      <tr>
        <td colspan="3">No clubs found. Import seed.sql in phpMyAdmin.</td>
      </tr>
    `;
    return;
  }

  elements.clubsBody.innerHTML = state.clubs
    .map(
      (club) => `
        <tr data-admin-club-id="${club.id}" class="${club.id === state.selectedAdminClubId ? "selected" : ""}">
          <td>
            <strong>${escapeHtml(club.name)}</strong>
            <div class="table-meta">${escapeHtml(club.description)}</div>
          </td>
          <td>${escapeHtml(club.location)}</td>
          <td>${formatDate(club.created_at)}</td>
        </tr>
      `
    )
    .join("");

  for (const row of elements.clubsBody.querySelectorAll("tr[data-admin-club-id]")) {
    row.addEventListener("click", () => selectAdminClub(row.dataset.adminClubId));
  }
}

function renderAdminTables(tables) {
  if (tables.length === 0) {
    elements.tablesList.innerHTML = `<div class="empty-state">No tables found for this club.</div>`;
    return;
  }

  elements.tablesList.innerHTML = tables
    .map(
      (table) => `
        <article class="table-row">
          <div>
            <strong>${escapeHtml(table.label)}</strong>
            <div class="table-meta">
              ${table.capacity} guests - ${formatCurrency(table.min_consumable)} min consumable
            </div>
          </div>
          <span class="badge ${table.is_active ? "" : "offline"}">
            ${table.is_active ? "Active" : "Inactive"}
          </span>
        </article>
      `
    )
    .join("");
}

function renderReservations() {
  if (state.reservations.length === 0) {
    elements.reservationsBody.innerHTML = `
      <tr>
        <td colspan="5">No reservations yet.</td>
      </tr>
    `;
    return;
  }

  elements.reservationsBody.innerHTML = state.reservations
    .map(
      (reservation) => `
        <tr>
          <td>
            <strong>${escapeHtml(reservation.customer_name)}</strong>
            <div class="table-meta">${escapeHtml(reservation.customer_email)}</div>
          </td>
          <td>${escapeHtml(reservation.club_name)}</td>
          <td>${escapeHtml(reservation.table_label)}</td>
          <td>${formatDate(reservation.booking_date)}</td>
          <td><span class="badge">${escapeHtml(reservation.status)}</span></td>
        </tr>
      `
    )
    .join("");
}

function renderUsers() {
  if (state.users.length === 0) {
    elements.usersBody.innerHTML = `
      <tr>
        <td colspan="4">No users found. Import seed.sql or run the role migration.</td>
      </tr>
    `;
    return;
  }

  elements.usersBody.innerHTML = state.users
    .map(
      (user) => `
        <tr>
          <td>
            <strong>${escapeHtml(user.name)}</strong>
            <div class="table-meta">${escapeHtml(user.email)}</div>
          </td>
          <td><span class="badge">${escapeHtml(formatRole(user.role, user.role_label))}</span></td>
          <td>${escapeHtml(user.club_name || "All clubs")}</td>
          <td>${formatDate(user.created_at)}</td>
        </tr>
      `
    )
    .join("");
}

function renderUserClubs() {
  if (state.clubs.length === 0) {
    elements.userClubList.innerHTML = `<div class="empty-state">No clubs available.</div>`;
    return;
  }

  elements.userClubList.innerHTML = state.clubs
    .map(
      (club) => `
        <button class="club-card ${club.id === state.selectedUserClubId ? "selected" : ""}" type="button" data-user-club-id="${club.id}">
          <span class="club-card-title">${escapeHtml(club.name)}</span>
          <span>${escapeHtml(club.location)}</span>
          <small>${escapeHtml(club.description)}</small>
        </button>
      `
    )
    .join("");

  for (const card of elements.userClubList.querySelectorAll("[data-user-club-id]")) {
    card.addEventListener("click", () => selectUserClub(card.dataset.userClubId));
  }
}

function renderUserTables(tables) {
  if (tables.length === 0) {
    elements.userTablesList.innerHTML = `<div class="empty-state">No tables available.</div>`;
    return;
  }

  elements.userTablesList.innerHTML = tables
    .map(
      (table) => `
        <article class="booking-row">
          <div>
            <strong>${escapeHtml(table.label)}</strong>
            <div class="table-meta">
              Seats ${table.capacity} - ${formatCurrency(table.min_consumable)}
            </div>
          </div>
          <button class="button button-secondary reserve-button" type="button" disabled>Reserve</button>
        </article>
      `
    )
    .join("");
}

async function selectAdminClub(clubId) {
  state.selectedAdminClubId = clubId;
  const club = state.clubs.find((item) => item.id === clubId);
  elements.selectedClubLabel.textContent = club
    ? `${club.name} - ${club.location}`
    : "Loading tables...";
  elements.tablesList.innerHTML = `<div class="empty-state">Loading tables...</div>`;
  renderAdminClubs();

  try {
    const tables = await fetchJson(`/clubs/${clubId}/tables`);
    renderAdminTables(tables);
  } catch (error) {
    elements.tablesList.innerHTML = `<div class="error-state">${error.message}</div>`;
  }
}

async function selectUserClub(clubId) {
  state.selectedUserClubId = clubId;
  const club = state.clubs.find((item) => item.id === clubId);
  elements.userSelectedClubLabel.textContent = club
    ? `${club.name} - ${club.location}`
    : "Loading tables...";
  elements.userTablesList.innerHTML = `<div class="empty-state">Loading tables...</div>`;
  renderUserClubs();

  try {
    const tables = await fetchJson(`/clubs/${clubId}/tables`);
    renderUserTables(tables);
  } catch (error) {
    elements.userTablesList.innerHTML = `<div class="error-state">${error.message}</div>`;
  }
}

function showLogin() {
  state.currentUser = null;
  localStorage.removeItem(sessionKey);
  elements.appShell.classList.add("is-hidden");
  elements.loginScreen.classList.remove("is-hidden");
  elements.emailInput.focus();
}

function showDashboard(user) {
  state.currentUser = user;
  localStorage.setItem(sessionKey, JSON.stringify(user));
  elements.userBadge.textContent = `${user.name} (${formatRole(user.role, user.role_label)})`;
  elements.loginScreen.classList.add("is-hidden");
  elements.appShell.classList.remove("is-hidden");
  setView(state.currentView);
  loadDashboard();
}

async function handleLogin(event) {
  event.preventDefault();
  elements.loginMessage.textContent = "";

  const email = elements.emailInput.value.trim();
  const submitButton = elements.loginForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Signing in";

  try {
    const { user } = await fetchJson("/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    showDashboard(user);
  } catch (error) {
    elements.loginMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Continue";
  }
}

function restoreSession() {
  const storedUser = localStorage.getItem(sessionKey);
  if (!storedUser) {
    showLogin();
    return;
  }

  try {
    showDashboard(JSON.parse(storedUser));
  } catch {
    showLogin();
  }
}

async function loadDashboard() {
  elements.refreshButton.disabled = true;
  elements.refreshButton.textContent = "Refreshing";

  try {
    const [health, dbHealth, clubs, analytics, reservations, users] = await Promise.all([
      fetchJson("/health"),
      fetchJson("/db/health"),
      fetchJson("/clubs"),
      fetchJson("/admin/analytics"),
      fetchJson("/admin/reservations"),
      fetchJson("/admin/users"),
    ]);

    setStatus(elements.apiStatus, health.status.toUpperCase(), true);
    setStatus(elements.dbStatus, dbHealth.database, true);

    state.clubs = clubs;
    state.analytics = analytics;
    state.reservations = reservations;
    state.users = users;
    state.selectedAdminClubId = state.selectedAdminClubId || clubs[0]?.id || null;
    state.selectedUserClubId = state.selectedUserClubId || clubs[0]?.id || null;

    renderAnalytics(analytics);
    renderAdminClubs();
    renderReservations();
    renderUsers();
    renderUserClubs();

    if (state.selectedAdminClubId) {
      await selectAdminClub(state.selectedAdminClubId);
    } else {
      elements.tablesList.innerHTML = `<div class="empty-state">Import seed.sql to see tables.</div>`;
    }

    if (state.selectedUserClubId) {
      await selectUserClub(state.selectedUserClubId);
    } else {
      elements.userTablesList.innerHTML = `<div class="empty-state">No clubs available.</div>`;
    }

    elements.loadedAt.textContent = `Loaded ${new Date().toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } catch (error) {
    setStatus(elements.apiStatus, "Error", false);
    setStatus(elements.dbStatus, "Check MySQL", false);
    elements.clubsBody.innerHTML = `
      <tr>
        <td colspan="3">${escapeHtml(error.message)}</td>
      </tr>
    `;
    elements.tablesList.innerHTML = `<div class="error-state">Could not load admin data.</div>`;
    elements.usersBody.innerHTML = `
      <tr>
        <td colspan="4">${escapeHtml(error.message)}</td>
      </tr>
    `;
    elements.userClubList.innerHTML = `<div class="error-state">Could not load user view.</div>`;
    elements.userTablesList.innerHTML = `<div class="error-state">Check MySQL and refresh.</div>`;
  } finally {
    elements.refreshButton.disabled = false;
    elements.refreshButton.textContent = "Refresh";
  }
}

elements.loginForm.addEventListener("submit", handleLogin);
elements.logoutButton.addEventListener("click", showLogin);
elements.refreshButton.addEventListener("click", loadDashboard);

for (const item of elements.navItems) {
  item.addEventListener("click", () => setView(item.dataset.view));
}

restoreSession();
