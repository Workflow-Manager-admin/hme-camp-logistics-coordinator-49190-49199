import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./SidebarNav.css";

const navBaseItems = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/calendar", label: "Calendar", icon: "🗓️" },
  { to: "/accommodations", label: "Accommodations", icon: "🏕️" },
  { to: "/jobs", label: "Jobs", icon: "🛠️" },
  { to: "/meals", label: "Meals", icon: "🍽️" },
  { to: "/payments", label: "Payments", icon: "💸" },
  { to: "/roster", label: "Roster", icon: "👥" }
];

// PUBLIC_INTERFACE
function SidebarNav() {
  const location = useLocation();
  const { isAdmin } = useContext(AuthContext);

  const navItems = [...navBaseItems];
  if (isAdmin) {
    navItems.push({ to: "/admin", label: "Admin Tools", icon: "🛡️" });
  }

  return (
    <nav className="sidebar">
      <ul>
        {navItems.map(item => (
          <li
            key={item.to}
            className={location.pathname === item.to ? "active" : ""}
          >
            <Link to={item.to}>
              <span className="icon">{item.icon}</span> {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SidebarNav;
