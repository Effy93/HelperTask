import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
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
            <span
              key={key}
              className={index >= 5 ? "logo-accent" : undefined}
              style={{ transitionDelay: `${index * 0.08}s` }}
            >
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
                >
                  <span className="nav-icon-mobile">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="nav-label">Profil</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-logout"
                  aria-label="Se déconnecter"
                >
                  <span className="nav-icon-mobile">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </span>
                  <span className="nav-label">Déconnexion</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
