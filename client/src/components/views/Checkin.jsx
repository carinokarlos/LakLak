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