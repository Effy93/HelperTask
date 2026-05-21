import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import logoAddCollab from "../assets/images/btn-addCollab.png";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

const API = import.meta.env.VITE_API_URL as string;

type InvitationInfo = {
  email: string;
  role: string;
  projectId: number;
  projectTitle: string;
  inviterName: string;
};

type PageState = "loading" | "valid" | "invalid" | "accepting" | "accepted";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      setErrorMsg("Lien d'invitation invalide.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API}/api/invitations/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.message ?? "Invitation invalide ou expirée.");
          setPageState("invalid");
          return;
        }
        setInvitation(data);
        setPageState("valid");
      } catch {
        setErrorMsg("Erreur réseau.");
        setPageState("invalid");
      }
    };

    verify();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setPageState("accepting");
    try {
      const res = await fetch(`${API}/api/invitations/${token}/accept`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message ?? "Erreur lors de l'acceptation.");
        setPageState("valid");
        return;
      }
      setPageState("accepted");
      setTimeout(() => navigate(`/project/${data.projectId}`), 1800);
    } catch {
      setErrorMsg("Erreur réseau.");
      setPageState("valid");
    }
  };

  if (authLoading || pageState === "loading") {
    return (
      <div className="invite-page">
        <div className="invite-card">
          <p>Vérification de l'invitation…</p>
        </div>
      </div>
    );
  }

  if (pageState === "invalid") {
    return (
      <div className="invite-page">
        <div className="invite-card">
          <img src={logoAddCollab} alt="" className="invite-card-icon" />
          <h1>Invitation invalide</h1>
          <p className="invite-card-meta">{errorMsg}</p>
          <div className="invite-card-actions">
            <Link
              to="/"
              className="primary-btn"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === "accepted") {
    return (
      <div className="invite-page">
        <div className="invite-card">
          <img src={logoAddCollab} alt="" className="invite-card-icon" />
          <h1>Invitation acceptée !</h1>
          <p className="invite-card-meta">Redirection vers le projet…</p>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="invite-page">
      <div className="invite-card">
        <img src={logoAddCollab} alt="" className="invite-card-icon" />
        <h1>Vous êtes invité !</h1>
        <p className="invite-card-project">« {invitation.projectTitle} »</p>
        <p className="invite-card-meta">
          {invitation.inviterName} vous invite en tant que{" "}
          <strong>
            {invitation.role === "product_owner"
              ? "Product Owner"
              : "Collaborateur"}
          </strong>
          .
        </p>

        {user ? (
          user.email.toLowerCase() === invitation.email.toLowerCase() ? (
            <div className="invite-card-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={handleAccept}
                disabled={pageState === "accepting"}
              >
                {pageState === "accepting"
                  ? "Acceptation…"
                  : "Accepter l'invitation"}
              </button>
              {errorMsg && <p className="invite-card-error">{errorMsg}</p>}
            </div>
          ) : (
            <div className="invite-card-actions">
              <p className="invite-card-error">
                Cette invitation est destinée à{" "}
                <strong>{invitation.email}</strong>.<br />
                Vous êtes connecté avec un autre compte.
              </p>
              <Link
                to="/login"
                className="cancel-btn"
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Se connecter avec le bon compte
              </Link>
            </div>
          )
        ) : (
          <div className="invite-card-actions">
            <Link
              to={`/login?token=${token}`}
              className="primary-btn"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Se connecter pour accepter
            </Link>
            <Link
              to={`/register?token=${token}`}
              className="cancel-btn"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
