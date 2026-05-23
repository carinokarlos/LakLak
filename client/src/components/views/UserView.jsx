import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../ui/EmptyState";
import { formatDate, formatCurrency, formatDateInput } from "../../utils/helpers";

// Since we don't have utils yet, we'll define helper functions here or import from a utils file.
// For now, let's copy the helper functions from the original App.jsx that are needed.
// Alternatively, we can pass them as props. But to keep the split clean, let's create a utils file.
// However, due to the scope, I'll define them in the component for now and then we can move them later.

const UserView = ({
  currentUser,
  loadDashboard,
  isRefreshing,
  dashboardLoaded,
  loadError,
  clubs,
  setSelectedUserClubId,
  selectedUserClubId,
  selectedUserClub,
  userTables,
  userTableError,
  bookingForm,
  setBookingForm,
  selectedBookingTable,
  setSelectedBookingTable,
  bookingMessage,
  setBookingMessage,
  isBooking,
  handleBookingSubmit,
  formatDateInput
}) => {
  const pageCopy = {
    user: {
      title: "User View",
      subtitle: "Customer-facing club and table browsing.",
    },
  }["user"];

  // Helper functions (copied from original App.jsx)
  const formatRole = (role, roleLabel) => {
    const ROLE_LABELS = {
      super_admin: "Superadmin",
      developer: "Developer",
      staff_admin: "Staff Admin",
      club_admin: "Club Admin",
      user: "User",
    };
    return roleLabel || ROLE_LABELS[role] || role;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  };

  return (
    <section className="view-panel">
      {loadError && <EmptyState tone="error">{loadError}</EmptyState>}

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
                className={club.id === selectedUserClubId ? "club-card selected" : "club-card"}
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
                setBookingForm((current) => ({
                  ...current,
                  customerName: event.target.value,
                }))
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
                setBookingForm((current) => ({
                  ...current,
                  customerEmail: event.target.value,
                }))
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
                setBookingForm((current) => ({
                  ...current,
                  bookingDate: event.target.value,
                }))
              }
              required
            />
          </label>

          <button className="button" type="submit" disabled={isBooking}>
            {isBooking ? "Creating" : "Create Pending Reservation"}
          </button>
          <p className={bookingMessage.type} role="status">
            {bookingMessage.text}
          </p>
        </form>
      </section>
    </section>
  );
};

export default UserView;