import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./form.css";

const API = import.meta.env.VITE_API_URL as string;

export default function RegisterForm() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [inviteProjectTitle, setInviteProjectTitle] = useState("");

  useEffect(() => {
    if (!inviteToken) return;
    const fetchInvite = async () => {
      try {
        const res = await fetch(`${API}/api/invitations/${inviteToken}`);
        if (!res.ok) return;
        const data = await res.json();
        setEmail(data.email);
        setEmailLocked(true);
        setInviteProjectTitle(data.projectTitle);
      } catch {
        // token invalide ou expiré, on laisse le formulaire normal
      }
    };
    fetchInvite();
  }, [inviteToken]);

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

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
        return;
      }

      // Auto-login après inscription
      const loginRes = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!loginRes.ok) {
        setMessage("Inscription réussie ! Connectez-vous pour continuer.");
        navigate("/login");
        return;
      }

      const meRes = await fetch(`${API}/api/me`, { credentials: "include" });
      const meData = await meRes.json();
      setUser(meData.user);

      if (inviteToken) {
        const acceptRes = await fetch(
          `${API}/api/invitations/${inviteToken}/accept`,
          { method: "POST", credentials: "include" },
        );
        const acceptData = await acceptRes.json();
        if (acceptRes.ok) {
          navigate(`/project/${acceptData.projectId}`);
          return;
        }
      }

      navigate("/profile");
    } catch {
      setMessage("Erreur réseau");
    }
  };

  return (
    <div>
      {inviteProjectTitle && (
        <p className="invite-banner">
          Vous rejoignez le projet <strong>« {inviteProjectTitle} »</strong>
        </p>
      )}

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
            readOnly={emailLocked}
            onChange={(e) => !emailLocked && setEmail(e.target.value)}
            style={emailLocked ? { opacity: 0.7, cursor: "not-allowed" } : {}}
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

        <button type="submit" className="btn-animated">
          <span>
            {inviteToken ? "S'inscrire et rejoindre le projet" : "S'inscrire"}
          </span>
        </button>
        <p style={{ marginTop: "1rem" }}>
          Déjà un compte ?{" "}
          <Link to={inviteToken ? `/login?token=${inviteToken}` : "/login"}>
            Se connecter
          </Link>
        </p>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
