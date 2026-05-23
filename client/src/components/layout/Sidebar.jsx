import { useCallback } from "react";
import { Brand } from "../ui/Brand";

const Sidebar = ({ currentUser, currentView, onViewChange }) => {
  const handleViewChange = useCallback((view) => {
    onViewChange(view);
  }, [onViewChange]);

  if (!currentUser) {
    return null;
  }

  return (
    <aside className="sidebar">
      <Brand />

      <nav className="nav-list" aria-label="Main navigation">
        <button
          className={currentView === "admin" ? "nav-item active" : "nav-item"}
          type="button"
          onClick={() => handleViewChange("admin")}
        >
          Admin Dashboard
        </button>
        <button
          className={currentView === "user" ? "nav-item active" : "nav-item"}
          type="button"
          onClick={() => handleViewChange("user")}
        >
          User View
        </button>
        <button
          className={currentView === "checkin" ? "nav-item active" : "nav-item"}
          type="button"
          onClick={() => handleViewChange("checkin")}
        >
          Check-in
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;