import { useState } from "react";
import logoAddCollab from "../assets/images/btn-addCollab.png";

const API = import.meta.env.VITE_API_URL as string;

type Props = {
  projectId: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function InviteCollaboratorModal({
  projectId,
  onClose,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState("");
  const [addedType, setAddedType] = useState<"added" | "invited" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("L'adresse email est requise.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/invitations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Erreur lors de l'envoi.");
        return;
      }
      setAddedType(data.type ?? "invited");
      onSuccess();
      setTimeout(onClose, 2000);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="invite-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <dialog
        open
        className="invite-modal"
        aria-label="Inviter un collaborateur"
      >
        <button
          type="button"
          className="invite-modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <div className="invite-modal-header">
          <img src={logoAddCollab} alt="" className="invite-modal-icon" />
          <div>
            <h2 className="invite-modal-title">Inviter un collaborateur</h2>
            <p className="invite-modal-desc">
              Saisissez l'adresse email de la personne que vous souhaitez
              inviter.
            </p>
          </div>
        </div>

        {addedType ? (
          <p className="invite-success">
            {addedType === "added"
              ? "Collaborateur ajouté directement !"
              : "Invitation envoyée ! Un email a été transmis."}
          </p>
        ) : (
          <div className="invite-modal-body">
            <label className="invite-label">
              Adresse email *
              <input
                type="email"
                className="invite-input"
                placeholder="exemple@mail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </label>
            {error && <p className="invite-error">{error}</p>}
            <div className="invite-modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Annuler
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Envoi…" : "Envoyer l'invitation"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
