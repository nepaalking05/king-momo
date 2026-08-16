import { NavLink } from "react-router-dom";
import "./bottomNav.css";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">

      <NavLink
        to="/"
        className={({ isActive }) =>
          `nav-item ${
            isActive ? "active" : ""
          }`
        }
      >
        {/* <span className="nav-icon">⌂</span> */}
        <span>Home</span>
      </NavLink>


      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `nav-item ${
            isActive ? "active" : ""
          }`
        }
      >
        {/* <span className="nav-icon">☰</span> */}
        <span>Orders</span>
      </NavLink>


      <NavLink
        to="/inventory"
        className={({ isActive }) =>
          `nav-item ${
            isActive ? "active" : ""
          }`
        }
      >
        {/* <span className="nav-icon">▦</span> */}
        <span>Inventory</span>
      </NavLink>


      <NavLink
        to="/stock"
        className={({ isActive }) =>
          `nav-item ${
            isActive ? "active" : ""
          }`
        }
      >
        {/* <span className="nav-icon">₹</span> */}
        <span>Expenses</span>
      </NavLink>


      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `nav-item ${
            isActive ? "active" : ""
          }`
        }
      >
        {/* <span className="nav-icon">▥</span> */}
        <span>Dashboard</span>
      </NavLink>

    </nav>
  );
}