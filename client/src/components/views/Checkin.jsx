import { useState } from "react";
import { EmptyState } from "../ui/EmptyState";

const Checkin = ({
  currentUser,
  loadDashboard,
  isRefreshing,
  dashboardLoaded,
  loadError,
  checkinHash,
  setCheckinHash,
  checkinMessage,
  setCheckinMessage,
  isCheckingIn,
  handleCheckin,
  formatDate
}) => {
  const pageCopy = {
    checkin: {
      title: "Door Check-in",
      subtitle: "Validate confirmed QR hashes at the entrance.",
    },
  }["checkin"];

  const fetchJson = useCallback(async (path, options = {}) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}${path}`, {
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

  // Note: We don't need to load dashboard data in checkin view for now
  // The original App only loaded dashboard data in admin view.
  // If we need to show checkin results or something, we might need to load reservations.
  // But for the MVP, the checkin view just verifies QR codes and shows a message.
  // We'll keep it simple and not load dashboard data here.

  return (
    <section className="view-panel">
      {loadError && <EmptyState tone="error">{loadError}</EmptyState>}

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
          <p className={checkinMessage.type} role="status">
            {checkinMessage.text}
          </p>
        </form>
      </section>
    </section>
  );
};

export default Checkin;