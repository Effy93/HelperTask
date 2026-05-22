import { FiCalendar } from "react-icons/fi";
import logoAddCollab from "../../assets/images/btn-addCollab.webp";
import type { Collaborator } from "../../services/collaboratorService";
import { getAvatarColor, getInitials } from "../../utils/avatar";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "../../utils/taskStatus";

type Props = {
  collaborators: Collaborator[];
  isOwner: boolean;
  onInvite: () => void;
};

export default function BoardSidebar({
  collaborators,
  isOwner,
  onInvite,
}: Props) {
  return (
    <section className="board-info">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Légende</h3>
        <div className="sidebar-legend">
          {TASK_STATUSES.map((s) => (
            <div key={s} className="legend-item">
              <span className={`legend-dot legend-dot--${s}`} />
              <span>{TASK_STATUS_LABELS[s]}</span>
            </div>
          ))}
          <div className="legend-item">
            <FiCalendar className="legend-icon" />
            <span>Deadline</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Collaborateurs</h3>
        <div className="sidebar-collabs">
          {collaborators.map((c) => (
            <div key={c.id} className="sidebar-collab">
              <span
                className="avatar-circle avatar-circle--md"
                style={{ background: getAvatarColor(c.id) }}
              >
                {getInitials(c.name)}
              </span>
              <span className="sidebar-collab-info">
                <span className="sidebar-collab-name">{c.name}</span>
                {c.role === "product_owner" && (
                  <span className="badge-po">PO</span>
                )}
              </span>
            </div>
          ))}
          {isOwner && (
            <div className="sidebar-collab">
              <button
                type="button"
                className="add-collab-btn add-collab-btn--md"
                onClick={onInvite}
                title="Inviter un collaborateur"
              >
                <img src={logoAddCollab} alt="Inviter un collaborateur" />
              </button>
              <span className="sidebar-collab-name add-collab-label">
                Inviter un collaborateur
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
