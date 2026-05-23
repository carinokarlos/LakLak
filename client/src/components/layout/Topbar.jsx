import { useCallback } from "react";
import { Brand } from "../ui/Brand";

const Topbar = ({
  pageCopy,
  currentUser,
  formatRole,
  isRefreshing,
  loadDashboard,
  handleLogout
}) => {
  return (
    <header className="topbar">
      <div>
        <h1>{pageCopy.title}</h1>
        <p>{pageCopy.subtitle}</p>
      </div>
      <div className="topbar-actions">
        <div className="user-badge">
          {currentUser.name} ({formatRole(currentUser.role, currentUser.role_label)})
        </div>
        <button className="button" type="button" onClick={loadDashboard}>
          {isRefreshing ? "Refreshing" : "Refresh"}
        </button>
        <button className="button button-secondary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;