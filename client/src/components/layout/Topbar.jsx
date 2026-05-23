import { useEffect, useState } from "react";

const Topbar = ({
  pageCopy,
  currentUser,
  formatRole,
  isRefreshing,
  loadDashboard,
  handleLogout
}) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("laklak.theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("laklak.theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

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
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <button className="button" type="button" onClick={loadDashboard}>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button className="button button-secondary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
