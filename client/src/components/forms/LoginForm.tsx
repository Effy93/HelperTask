import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./form.css";

const API = import.meta.env.VITE_API_URL as string;

export default function LoginForm() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setMessage("Erreur de connexion");
        return;
      }

      // 🔥 récupérer le user
      const meRes = await fetch(`${API}/api/me`, {
        credentials: "include",
      });

      const userData = await meRes.json();

      setUser(userData.user); // ✅ FIX ICI

      navigate("/profile");
    } catch {
      setMessage("Erreur réseau");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            id="email"
            type="email"
            required
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="input-group">
          <input
            id="password"
            type="password"
            required
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password">Mot de passe</label>
        </div>

        <button type="submit" className="btn-animated"><span>Se connecter</span></button>

        <p style={{ marginTop: "1rem" }}>
          Pas de compte ? <Link to="/register">S’inscrire</Link>
        </p>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
