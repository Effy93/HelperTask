import type { ITask, TaskStatus } from "../../../../server/src/types/ITask";
import type { Collaborator } from "../../services/collaboratorService";
import { getAvatarColor, getInitials } from "../../utils/avatar";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "../../utils/taskStatus";

type Props = {
  open: boolean;
  editingTask: ITask | null;
  title: string;
  content: string;
  status: TaskStatus;
  deadline: string;
  assigneeIds: number[];
  collaborators: Collaborator[];
  onChangeTitle: (v: string) => void;
  onChangeContent: (v: string) => void;
  onChangeStatus: (v: TaskStatus) => void;
  onChangeDeadline: (v: string) => void;
  onAddAssignee: (id: number) => void;
  onRemoveAssignee: (id: number) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function TaskDrawer({
  open,
  editingTask,
  title,
  content,
  status,
  deadline,
  assigneeIds,
  collaborators,
  onChangeTitle,
  onChangeContent,
  onChangeStatus,
  onChangeDeadline,
  onAddAssignee,
  onRemoveAssignee,
  onSubmit,
  onClose,
}: Props) {
  const available = collaborators.filter((c) => !assigneeIds.includes(c.id));

  return (
    <aside
      className={`task-drawer ${open ? "open" : ""}`}
      aria-expanded={open}
      aria-label="Panneau de tâche"
    >
      <div className="drawer-header">
        <div>
          <h2>{editingTask ? "Modifier la tâche" : "Nouvelle tâche"}</h2>
          <p>Renseigne le titre, la description et un collaborateur.</p>
        </div>
        <button
          type="button"
          className="drawer-close"
          onClick={onClose}
          aria-label="Fermer le panneau"
        >
          ×
        </button>
      </div>

      <div className="drawer-body">
        <label>
          Titre
          <input
            type="text"
            placeholder="Titre de la tâche"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            placeholder="Description (facultatif)"
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
          />
        </label>

        <label>
          Colonne
          <select
            value={status}
            onChange={(e) => onChangeStatus(e.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <div className="drawer-field">
          <span className="drawer-field-label">Assignés</span>
          {assigneeIds.length > 0 && (
            <div className="assignee-pills">
              {assigneeIds.map((uid) => {
                const collab = collaborators.find((c) => c.id === uid);
                if (!collab) return null;
                return (
                  <span key={uid} className="assignee-pill">
                    <span
                      className="avatar-circle assignee-pill-avatar"
                      style={{ background: getAvatarColor(uid) }}
                    >
                      {getInitials(collab.name)}
                    </span>
                    {collab.name}
                    <button
                      type="button"
                      className="assignee-pill-remove"
                      onClick={() => onRemoveAssignee(uid)}
                      aria-label={`Retirer ${collab.name}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {available.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) onAddAssignee(id);
              }}
            >
              <option value="">+ Ajouter un collaborateur</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <label>
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => onChangeDeadline(e.target.value)}
          />
        </label>

        <div className="drawer-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="primary-btn" onClick={onSubmit}>
            {editingTask ? "Enregistrer" : "Créer la tâche"}
          </button>
        </div>
      </div>
    </aside>
  );
}
