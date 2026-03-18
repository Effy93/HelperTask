import { useState } from "react";
import "./form.css";
import type { IUser } from "../../../../server/src/types/IUser";

interface FormProps {
  setUser: (user: IUser | null) => void;
}

export default function RegisterForm({ setUser }: FormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const validateEmail = (email: string) => {
    // simple regex pour vérifier un email basique
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // ✅ Vérifications locales avant fetch
    if (!validateEmail(email)) {
      setMessage("Email invalide.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3310/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Erreur d'inscription");
        setUser(null);
      } else {
        setMessage(
          "Inscription réussie ! Vous pouvez maintenant vous connecter.",
        );

        // Optionnel : connecter directement après inscription
        // const loginRes = await fetch("http://localhost:3310/api/login", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   credentials: "include",
        //   body: JSON.stringify({ email, password }),
        // });
        // const loginData = await loginRes.json();
        // if (loginRes.ok) {
        //   const meRes = await fetch("http://localhost:3310/api/me", { credentials: "include" });
        //   const meData = await meRes.json();
        //   setUser(meData);
        // }
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
            type="text"
            id="name"
            required
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="name">Nom</label>
        </div>

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

        <div className="input-group">
          <input
            type="password"
            id="confirmPassword"
            required
            placeholder=" "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
        </div>

        <button type="submit">S'inscrire</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
