import { useState } from "react";
import { Link } from "react-router-dom";
import "./form.css";
import type { IUser } from "../../../../server/src/types/IUser";

const API = import.meta.env.VITE_API_URL as string;

interface FormProps {
  setUser?: (user: IUser | null) => void;
}

export default function RegisterForm({ setUser }: FormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!validateEmail(email)) {
      setMessage("Email invalide.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Erreur d'inscription");
        setUser?.(null);
      } else {
        setMessage("Inscription réussie !");
        setUser?.(null);
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur réseau");
      setUser?.(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            id="name"
            type="text"
            required
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="name">Nom</label>
        </div>

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

        <div className="input-group">
          <input
            id="confirmPassword"
            type="password"
            required
            placeholder=" "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
        </div>

        <button type="submit" className="btn-animated"><span>S'inscrire</span></button>
        <p style={{ marginTop: "1rem" }}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
