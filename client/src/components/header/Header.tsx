import { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiLogOut, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logoutImg from "../../assets/images/logout.webp";
import profileImg from "../../assets/images/profile.webp";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import "./header.css";

const API = import.meta.env.VITE_API_URL as string;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { isDsy, toggleTheme } = useTheme();

  const logoText = "Task Helper";

  const [logoChars] = useState(() =>
    logoText.split("").map((char) => ({
      char,
      key: `${char}-${Math.random().toString(36).slice(2, 5)}`,
    })),
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch(`${API}/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    navigate("/");
  };

  return (
    <header className={`header ${scrolled ? "header--small" : ""}`}>
      <h1 className="logo">
        <Link to="/" className="logo-link">
          {logoChars.map(({ char, key }, index) => (
            <span key={key} style={{ transitionDelay: `${index * 0.08}s` }}>
              {char}
            </span>
          ))}
        </Link>
      </h1>

      <nav>
        <ul>
          <li>
            <button
              type="button"
              className={`nav-theme-toggle${isDsy ? " nav-theme-toggle--active" : ""}`}
              onClick={toggleTheme}
              aria-pressed={isDsy}
              aria-label={
                isDsy ? "Passer en mode standard" : "Passer en mode dys"
              }
              data-tooltip={isDsy ? "Mode standard" : "Mode dys"}
            >
              {isDsy ? <FiEyeOff /> : <FiEye />}
            </button>
          </li>

          {!user && (
            <li>
              <Link to="/login" className="nav-link">
                Connexion
              </Link>
            </li>
          )}

          {user && (
            <>
              <li>
                <Link
                  to="/profile"
                  className="nav-icon-link"
                  aria-label="Espace perso"
                  data-tooltip="Espace perso"
                >
                  {isDsy ? (
                    <FiUser className="nav-icon-dsy" />
                  ) : (
                    <img src={profileImg} alt="" />
                  )}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-logout"
                  aria-label="Se déconnecter"
                  data-tooltip="Se déconnecter"
                >
                  {isDsy ? (
                    <FiLogOut className="nav-icon-dsy" />
                  ) : (
                    <img src={logoutImg} alt="" />
                  )}
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
