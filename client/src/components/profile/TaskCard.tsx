import "./task-card.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiCheck, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import type { ITask, TaskStatus } from "../../../../server/src/types/ITask";
import { getAvatarColor, getInitials } from "../../utils/avatar";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "../../utils/taskStatus";
import type { Assignee } from "./Column";

const MAX_VISIBLE_AVATARS = 3;

type Props = {
  task: ITask;
  assignees?: Assignee[];
  onDelete?: (taskId: number) => void;
  onUpdate?: (taskId: number, updates: Partial<ITask>) => void;
  onStatusChange?: (taskId: number, status: TaskStatus) => void;
  isOverlay?: boolean;
};

export default function TaskCard({
  task,
  assignees = [],
  onDelete,
  onUpdate,
  onStatusChange,
  isOverlay = false,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id.toString(),
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editContent, setEditContent] = useState(task.content);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(task.title);
    setEditContent(task.content);
  }, [task.title, task.content]);

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
    }
  }, [isEditing]);

  const saveChanges = () => {
    if (!editTitle.trim()) return;
    onUpdate?.(task.id, { title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const statusOptions = TASK_STATUSES.map((s) => ({
    status: s,
    label: TASK_STATUS_LABELS[s],
  }));

  const visibleAssignees = assignees.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = assignees.length - MAX_VISIBLE_AVATARS;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isEditing ? {} : listeners)}
      className={`task-card${isDragging ? " task-card--dragging" : ""}${isOverlay ? " task-card--overlay" : ""}`}
    >
      <div className="task-card-content">
        {isEditing ? (
          <div className="task-card-editable">
            <div className="input-row">
              <label htmlFor={`task-title-${task.id}`} className="sr-only">
                Titre de la tâche
              </label>
              <input
                ref={titleInputRef}
                id={`task-title-${task.id}`}
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.stopPropagation();
                    saveChanges();
                  } else if (event.key === "Escape") {
                    event.stopPropagation();
                    setIsEditing(false);
                    setEditTitle(task.title);
                    setEditContent(task.content);
                  }
                }}
              />
              <button
                type="button"
                className="icon-btn icon-success"
                onClick={(event) => {
                  event.stopPropagation();
                  saveChanges();
                }}
                aria-label="Valider les modifications"
                data-tooltip="Valider"
              >
                <FiCheck />
              </button>
              <button
                type="button"
                className="icon-btn icon-danger"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditing(false);
                  setEditTitle(task.title);
                  setEditContent(task.content);
                }}
                aria-label="Annuler les modifications"
                data-tooltip="Annuler"
              >
                <FiX />
              </button>
            </div>
            <div className="input-row">
              <label htmlFor={`task-content-${task.id}`} className="sr-only">
                Description de la tâche
              </label>
              <input
                id={`task-content-${task.id}`}
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.stopPropagation();
                    saveChanges();
                  } else if (event.key === "Escape") {
                    event.stopPropagation();
                    setIsEditing(false);
                    setEditTitle(task.title);
                    setEditContent(task.content);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="task-card-title-row">
              <strong>{task.title}</strong>
            </div>
            {task.content && <p>{task.content}</p>}

            <div className="task-card-meta">
              {assignees.length > 0 && (
                <div className="avatar-stack">
                  {visibleAssignees.map((a) => (
                    <span
                      key={a.id}
                      className="avatar-circle"
                      style={{ background: getAvatarColor(a.id) }}
                      title={a.name}
                    >
                      {getInitials(a.name)}
                    </span>
                  ))}
                  {overflow > 0 && (
                    <span className="avatar-circle avatar-overflow">
                      +{overflow}
                    </span>
                  )}
                </div>
              )}

              {task.deadline && (
                <span className="task-card-deadline">
                  <FiCalendar className="deadline-icon" />
                  {new Date(task.deadline).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="task-card-footer">
        <div className="task-card-hint" aria-hidden="true" />
        <div className="task-card-footer-row">
          <div className="task-card-status">
            <div className="status-segment">
              {statusOptions.map((option) => (
                <button
                  key={option.status}
                  type="button"
                  className={`status-seg-btn status-seg-btn--${option.status}${task.status === option.status ? " active" : ""}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.repeat) e.preventDefault();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onStatusChange?.(task.id, option.status);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="task-card-actions">
            {!isEditing && (
              <button
                type="button"
                className="task-card-edit"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditing(true);
                }}
                aria-label="Modifier la tâche"
              >
                <FiEdit2 />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="task-card-delete"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(task.id);
                }}
                aria-label="Supprimer la tâche"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
