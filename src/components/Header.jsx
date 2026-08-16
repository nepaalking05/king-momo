import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

// import "./header.css";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  return (
    <header className="header">

      <div className="logo-wrap">

        <img
          src="/logo.png"
          alt="King Momo"
          className="logo"
        />

        <div>
          <h1>KING MOMO</h1>
          <span>Taste The Himalayas</span>
        </div>

      </div>


      <button
        type="button"
        className="logout-btn upi-btn"
        onClick={handleLogout}
        aria-label="Logout"
      >
        <span className="logout-icon">
          ↪
        </span>

        <span className="logout-text">
          Logout
        </span>
      </button>

    </header>
  );
}