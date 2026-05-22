import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import type { UserResponse } from "../../services/userService";
import { updateMe } from "../../services/userService";

type Props = {
  user: UserResponse;
  onUserUpdated: (updated: UserResponse) => void;
};

export default function ProfileHero({ user, onUserUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openForm = () => {
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setError("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = password ? { name, email, password } : { name, email };
      const data = await updateMe(payload);
      onUserUpdated(data.user);
      setOpen(false);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-hero">
      {!open ? (
        <>
          <div className="hero-body">
            <h2 className="hero-welcome">Bienvenue, {user.name}</h2>
            <p>Gérez vos projets et collaborez efficacement</p>
          </div>
          <div className="hero-footer">
            <button type="button" className="btn-edit-hero" onClick={openForm}>
              <FiEdit2 />
              Modifier mes infos
            </button>
          </div>
        </>
      ) : (
        <div className="hero-edit-form">
          <h2 className="hero-welcome">Modifier mes informations</h2>
          <div className="hero-edit-fields">
            <div className="input-field">
              <label htmlFor="hero-name" className="sr-only">
                Nom
              </label>
              <input
                id="hero-name"
                type="text"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label htmlFor="hero-email" className="sr-only">
                Email
              </label>
              <input
                id="hero-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label htmlFor="hero-password" className="sr-only">
                Nouveau mot de passe
              </label>
              <input
                id="hero-password"
                type="password"
                placeholder="Nouveau mot de passe (optionnel)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="hero-edit-error">{error}</p>}
          </div>
          <div className="hero-footer hero-footer--actions">
            <button
              type="button"
              className="btn-create btn-animated"
              onClick={handleSubmit}
              disabled={loading}
            >
              <span>{loading ? "Enregistrement…" : "Enregistrer"}</span>
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setOpen(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
