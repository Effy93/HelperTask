import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <div className="home-icon">
          <svg
            width="52"
            height="52"
            viewBox="0 0 52 52"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <rect
              x="1.5"
              y="1.5"
              width="49"
              height="49"
              rx="13"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16 26l8 8 12-16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="home-title">
          Task<span className="home-title__accent">Helper</span>
        </h1>

        <div className="home-divider" aria-hidden="true">
          <span className="home-divider__line" />
          <span className="home-divider__label">En cours de construction</span>
          <span className="home-divider__line" />
        </div>

        <p className="home-subtitle">
          Un outil pensé pour <em>organiser</em>
          <br />
          vos projets et simplifier votre quotidien.
        </p>

        <Link to="/login" className="home-cta">
          Commencer <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="home-badge" role="note">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="2.5" fill="currentColor" />
          <path
            d="M5 11.5h5.5V10H5v1.5zm8.5 0H19V10h-5.5v1.5zM9 11.5V20h2v-8.5H9zm4 0V20h2v-8.5h-2z"
            fill="currentColor"
          />
          <path
            d="M7 11.5C7 9.5 9.5 8 12 8s5 1.5 5 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span>Accessibilité au cœur de l'expérience</span>
      </div>
    </div>
  );
}
