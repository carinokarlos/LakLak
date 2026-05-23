import { StatTile } from "../ui/StatTile";
import { EmptyState } from "../ui/EmptyState";

const AdminDashboard = ({
  dashboardLoaded,
  loadError,
  systemStatus,
  clubs,
  analytics,
  reservations,
  users,
  selectedAdminClubId,
  setSelectedAdminClubId,
  selectedAdminClub,
  adminTables,
  tableError,
  formatDate,
  formatCurrency,
  truncateHash,
  handleReservationAction,
  activeReservationAction
}) => {
  return (
    <section className="view-panel">
      {loadError && <EmptyState tone="error">{loadError}</EmptyState>}

      <section className="status-grid" aria-label="System status">
        <StatTile
          label="API"
          value={systemStatus?.api || "Checking"}
          tone={
            systemStatus?.api === "OK"
              ? "ok"
              : systemStatus?.api === "Checking"
                ? "default"
                : "danger"
          }
        />
        <StatTile
          label="Database"
          value={systemStatus?.db || "Checking"}
          tone={
            systemStatus?.db === "connected"
              ? "ok"
              : systemStatus?.db === "Checking"
                ? "default"
                : "danger"
          }
        />
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
                      className={club.id === selectedAdminClubId ? "selected" : "clickable"}
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
                <span className={table.is_active ? "" : "offline"}>
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
                      <span className="badge">{user.role_label || user.role}</span>
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
  );
};

export default AdminDashboard;
