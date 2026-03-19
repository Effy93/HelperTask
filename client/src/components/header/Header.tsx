import { useEffect, useState } from "react";
import "./header.css";
import { Link } from "react-router-dom";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
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
            <Link to="/login" className="nav-link">
              Connexion
            </Link>
          </li>
          <li>
            <Link to="/profile" className="nav-link">
              Espace perso
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
