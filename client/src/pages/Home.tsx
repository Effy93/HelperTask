import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <h1>Task Helper</h1>

        <p className="subtitle">
          Une application simple pour organiser vos projets et vos tâches.
        </p>

        <p className="auth-text">
          Connectez-vous pour commencer à utiliser l'application.
        </p>

        <Link to="/login" className="home-btn">
          Commencer
        </Link>
      </div>
    </div>
  );
}
