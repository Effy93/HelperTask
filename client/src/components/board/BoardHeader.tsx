import { FiUser, FiUsers } from "react-icons/fi";
import type { Collaborator } from "../../services/collaboratorService";
import BackButton from "../BackButton";

type Project = { title: string; description: string };

type Props = {
  project: Project;
  collaborators: Collaborator[];
  onNewTask: () => void;
};

export default function BoardHeader({
  project,
  collaborators,
  onNewTask,
}: Props) {
  const po = collaborators.find((c) => c.role === "product_owner");
  const colabs = collaborators.filter((c) => c.role === "collaborator");

  return (
    <div className="profile-hero">
      <div className="hero-header">
        <BackButton to="/profile" />
      </div>
      <div className="hero-body">
        <h1>{project.title}</h1>
        {project.description && <p>{project.description}</p>}
        {collaborators.length > 0 && (
          <div className="hero-meta">
            {po && (
              <span className="hero-meta-item">
                <FiUser className="hero-meta-icon" />
                <strong>PO</strong>&nbsp;{po.name}
              </span>
            )}
            {colabs.length > 0 && (
              <span className="hero-meta-item">
                <FiUsers className="hero-meta-icon" />
                {colabs.map((c) => c.name).join(" · ")}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="hero-footer">
        <button
          type="button"
          className="add-task-toggle btn-animated"
          onClick={onNewTask}
        >
          <span>+ Nouvelle tâche</span>
        </button>
      </div>
    </div>
  );
}
