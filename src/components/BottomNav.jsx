import { NavLink } from "react-router-dom";
import './bottomNav.css'
export default function BottomNav() {
  return (
    <div className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Home
      </NavLink>

      <NavLink
        to="/orders"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Orders
      </NavLink>

      <NavLink
        to="/inventory"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Inventory
      </NavLink>

      {/* <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Profile
      </NavLink> */}
       <NavLink to="/stock"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Stock
      </NavLink>       <NavLink to="/dashboard"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Dashboard
      </NavLink>

    </div>
  );
}