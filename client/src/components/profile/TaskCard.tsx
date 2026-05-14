import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiTrash2, FiEdit2, FiCheck, FiX, FiChevronDown } from "react-icons/fi";
import type { ITask, TaskStatus } from "../../../../server/src/types/ITask";

type Props = {
  task: ITask;
  onDelete?: (taskId: number) => void;
  onUpdate?: (taskId: number, updates: Partial<ITask>) => void;
  onStatusChange?: (taskId: number, status: TaskStatus) => void;
};

export default function TaskCard({ task, onDelete, onUpdate, onStatusChange }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id.toString(),
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editContent, setEditContent] = useState(task.content);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  useEffect(() => {
    setEditTitle(task.title);
    setEditContent(task.content);
  }, [task.title, task.content]);

  const saveChanges = () => {
    if (!editTitle.trim()) return;
    onUpdate?.(task.id, { title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const statusOptions = [
    { status: "todo" as TaskStatus, label: "À faire" },
    { status: "doing" as TaskStatus, label: "En cours" },
    { status: "done" as TaskStatus, label: "Terminé" },
  ];

  const currentStatus = statusOptions.find((option) => option.status === task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
    >
      <div className="task-card-content">
        {isEditing ? (
          <div className="task-card-editable">
            <div className="input-row">
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
              />
              <button
                type="button"
                className="icon-btn icon-success"
                onClick={(event) => {
                  event.stopPropagation();
                  saveChanges();
                }}
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
              >
                <FiX />
              </button>
            </div>
            <div className="input-row">
              <input
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="task-card-title-row">
              <strong>{task.title}</strong>
            </div>
            {task.content && <p>{task.content}</p>}
          </>
        )}
      </div>

      <div className="task-card-footer">
        <div className="task-card-status">
          <div
            className="status-picker"
            onMouseLeave={() => setStatusMenuOpen(false)}
          >
            <button
              type="button"
              className="status-toggle"
              onClick={(event) => {
                event.stopPropagation();
                setStatusMenuOpen((current) => !current);
              }}
              title={currentStatus?.label}
            >
              <FiChevronDown />
            </button>
            <div className={`status-menu ${statusMenuOpen ? "open" : ""}`}>
              {statusOptions.map((option) => (
                <button
                  key={option.status}
                  type="button"
                  className={`status-item ${task.status === option.status ? "active" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setStatusMenuOpen(false);
                    onStatusChange?.(task.id, option.status);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="task-card-actions">
          {!isEditing && (
            <button
              type="button"
              className="task-card-edit"
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
  );
}
