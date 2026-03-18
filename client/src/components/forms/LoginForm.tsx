import { useState } from "react";
import "./form.css";
import type { IUser } from "../../../../server/src/types/IUser";
import "./form.css";

interface FormProps {
  setUser: (user: IUser | null) => void;
}

export default function LoginForm({ setUser }: FormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3310/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Erreur de connexion");
        setUser(null);
      } else {
        setMessage("Connexion réussie !");

        // Récupérer les infos de l'utilisateur
        const meRes = await fetch("http://localhost:3310/api/me", {
          credentials: "include",
        });
        const meData = await meRes.json();
        setUser(meData);
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur réseau");
      setUser(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="email"
            id="email"
            required
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            id="password"
            required
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password">Mot de passe</label>
        </div>

        <button type="submit">Se connecter</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
