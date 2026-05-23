import "./project-card.css";
import { useState } from "react";
import { FiCheck, FiEdit2, FiFolder, FiTrash2, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import logoAddCollab from "../../assets/images/btn-addCollab.webp";
import type { Collaborator } from "../../services/collaboratorService";
import type { Project } from "../../services/projectService";
import { getAvatarColor, getInitials } from "../../utils/avatar";

type Props = {
  project: Project;
  collaborators: Collaborator[];
  onUpdate: (id: number, title: string, description: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onInvite: (projectId: number) => void;
};

export default function ProjectCard({
  project,
  collaborators,
  onUpdate,
  onDelete,
  onInvite,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editDescription, setEditDescription] = useState(project.description);

  const isOwner = project.userRole === "product_owner";
  const visibleCollabs = collaborators.slice(0, 4);
  const overflow = collaborators.length - visibleCollabs.length;

  const handleSave = async () => {
    await onUpdate(project.id, editTitle, editDescription);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce projet ?")) return;
    await onDelete(project.id);
  };

  return (
    <div className="project-card">
      {editing ? (
        <div className="project-card-edit-form">
          <div className="input-row">
            <label htmlFor={`project-title-${project.id}`} className="sr-only">
              Nom du projet
            </label>
            <input
              id={`project-title-${project.id}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Nom du projet"
            />
            <button
              type="button"
              className="icon-btn icon-success"
              onClick={handleSave}
              aria-label="Valider les modifications"
              data-tooltip="Valider"
            >
              <FiCheck />
            </button>
            <button
              type="button"
              className="icon-btn icon-danger"
              onClick={() => setEditing(false)}
              aria-label="Annuler les modifications"
              data-tooltip="Annuler"
            >
              <FiX />
            </button>
          </div>
          <div className="input-row">
            <label htmlFor={`project-desc-${project.id}`} className="sr-only">
              Description du projet
            </label>
            <input
              id={`project-desc-${project.id}`}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="project-card-header">
            <Link to={`/project/${project.id}`} className="project-card-link">
              <span className="project-card-folder-wrap" aria-hidden="true">
                <FiFolder className="project-card-folder" />
              </span>
              <h3 className="project-title">{project.title}</h3>
            </Link>
            <div className="actions">
              {isOwner && (
                <button
                  type="button"
                  className="icon-btn icon-primary"
                  onClick={() => {
                    setEditTitle(project.title);
                    setEditDescription(project.description);
                    setEditing(true);
                  }}
                  aria-label={`Modifier le projet ${project.title}`}
                  data-tooltip="Modifier"
                >
                  <FiEdit2 />
                </button>
              )}
              {isOwner && (
                <button
                  type="button"
                  className="icon-btn icon-danger"
                  onClick={handleDelete}
                  aria-label={`Supprimer le projet ${project.title}`}
                  data-tooltip="Supprimer"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>

          {project.description && (
            <p className="project-card-desc">{project.description}</p>
          )}

          <div className="project-card-footer">
            {isOwner ? (
              <span className="badge-po">PO</span>
            ) : (
              <span className="badge-collab">Collab</span>
            )}
            <div className="project-card-collabs avatar-stack">
              {visibleCollabs.map((c) => (
                <span
                  key={c.id}
                  className="avatar-circle"
                  style={{ background: getAvatarColor(c.id) }}
                  title={c.name}
                >
                  {getInitials(c.name)}
                </span>
              ))}
              {overflow > 0 && (
                <span className="avatar-circle avatar-overflow">
                  +{overflow}
                </span>
              )}
              {isOwner && (
                <button
                  type="button"
                  className="add-collab-btn"
                  onClick={() => onInvite(project.id)}
                  title="Inviter un collaborateur"
                >
                  <img src={logoAddCollab} alt="Inviter un collaborateur" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
