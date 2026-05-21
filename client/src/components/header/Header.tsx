import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./header.css";

const API = import.meta.env.VITE_API_URL as string;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

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
                <Link to="/profile" className="nav-link">
                  Espace perso
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-link"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
