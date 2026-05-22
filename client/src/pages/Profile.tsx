import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL as string;
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

import { FiCheck, FiEdit2, FiFolder, FiTrash2, FiX } from "react-icons/fi";
import logoAddCollab from "../assets/images/btn-addCollab.png";
import InviteCollaboratorModal from "../components/InviteCollaboratorModal";

const AVATAR_COLORS = [
  "#fc7753",
  "#3498db",
  "#368d28",
  "#9b59b6",
  "#f39c12",
  "#e74c3c",
  "#1abc9c",
  "#fba875",
];
const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

type Collaborator = { id: number; name: string; email: string; role: string };

type Project = {
  id: number;
  title: string;
  description: string;
  userRole: string;
};

type ApiProject = {
  id_project: number;
  title: string;
  description: string;
  user_role: string;
};

export default function Profile() {
  const { user, loading, setUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectCollaborators, setProjectCollaborators] = useState<
    Record<number, Collaborator[]>
  >({});
  const [inviteProjectId, setInviteProjectId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [heroEditOpen, setHeroEditOpen] = useState(false);
  const [heroName, setHeroName] = useState("");
  const [heroEmail, setHeroEmail] = useState("");
  const [heroPassword, setHeroPassword] = useState("");
  const [heroError, setHeroError] = useState("");
  const [heroLoading, setHeroLoading] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const openHeroEdit = () => {
    if (!user) return;
    setHeroName(user.name);
    setHeroEmail(user.email);
    setHeroPassword("");
    setHeroError("");
    setHeroEditOpen(true);
  };

  const handleEditUser = async () => {
    if (!user) return;
    setHeroError("");
    setHeroLoading(true);
    try {
      const body: Record<string, string> = { name: heroName, email: heroEmail };
      if (heroPassword) body.password = heroPassword;
      const res = await fetch(`${API}/api/users/me`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setHeroError(data.message ?? "Erreur");
        return;
      }
      setUser({ ...user, ...data.user });
      setHeroEditOpen(false);
      setHeroPassword("");
    } catch {
      setHeroError("Erreur de connexion");
    } finally {
      setHeroLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch(`${API}/api/projects`, { credentials: "include" });
    const data = await res.json();
    const formatted: Project[] = Array.isArray(data)
      ? (data as ApiProject[]).map((p) => ({
          id: p.id_project,
          title: p.title,
          description: p.description,
          userRole: p.user_role,
        }))
      : [];
    setProjects(formatted);

    const collabResults = await Promise.all(
      formatted.map(async (p) => {
        const r = await fetch(`${API}/api/projects/${p.id}/collaborators`, {
          credentials: "include",
        });
        if (!r.ok) return { id: p.id, collabs: [] as Collaborator[] };
        const collabs = await r.json();
        return { id: p.id, collabs: Array.isArray(collabs) ? collabs : [] };
      }),
    );

    const map: Record<number, Collaborator[]> = {};
    for (const { id, collabs } of collabResults) map[id] = collabs;
    setProjectCollaborators(map);
  };

  const createProject = async () => {
    if (!title.trim()) {
      alert("Titre requis");
      return;
    }
    const res = await fetch(`${API}/api/projects`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) {
      alert("Erreur création projet");
      return;
    }
    await fetchProjects();
    setTitle("");
    setDescription("");
  };

  const updateProject = async (id: number) => {
    const res = await fetch(`${API}/api/projects/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDescription }),
    });
    if (!res.ok) {
      alert("Erreur modification");
      return;
    }
    await fetchProjects();
    setEditingId(null);
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Supprimer ce projet ?")) return;
    const res = await fetch(`${API}/api/projects/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      alert("Erreur suppression");
      return;
    }
    await fetchProjects();
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="profile-page">
      {/* HERO */}
      <div className="profile-hero">
        {!heroEditOpen ? (
          <>
            <div className="hero-body">
              <h2 className="hero-welcome">Bienvenue, {user.name}</h2>
              <p>Gérez vos projets et collaborez efficacement</p>
            </div>
            <div className="hero-footer">
              <button
                type="button"
                className="btn-edit-hero"
                onClick={openHeroEdit}
              >
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
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
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
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
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
                  value={heroPassword}
                  onChange={(e) => setHeroPassword(e.target.value)}
                />
              </div>
              {heroError && <p className="hero-edit-error">{heroError}</p>}
            </div>
            <div className="hero-footer hero-footer--actions">
              <button
                type="button"
                className="btn-create btn-animated"
                onClick={handleEditUser}
                disabled={heroLoading}
              >
                <span>{heroLoading ? "Enregistrement…" : "Enregistrer"}</span>
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setHeroEditOpen(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="profile-content">
        {/* CREATE */}
        <section id="create" className="profile-panel">
          <h2 className="panel-title">Créer un projet</h2>

          <div className="input-field">
            <label htmlFor="project-title" className="sr-only">
              Nom du projet
            </label>
            <input
              id="project-title"
              ref={titleInputRef}
              type="text"
              placeholder="Nom du projet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
            />
            {title.trim() && <FiCheck className="input-check-icon" />}
          </div>

          <div className="input-field">
            <label htmlFor="project-description" className="sr-only">
              Description
            </label>
            <textarea
              id="project-description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="panel-footer">
            <button
              type="button"
              className="btn-create btn-animated"
              onClick={createProject}
            >
              <span>Créer le projet</span>
            </button>
          </div>
        </section>

        {/* LIST */}
        <section id="projects" className="profile-panel">
          <h2 className="panel-title">Mes projets</h2>

          {projects.length === 0 && (
            <p className="projects-empty">Aucun projet pour l'instant.</p>
          )}

          {projects.map((project) => {
            const collabs = projectCollaborators[project.id] ?? [];
            const isOwner = project.userRole === "product_owner";
            const visibleCollabs = collabs.slice(0, 4);
            const overflow = collabs.length - visibleCollabs.length;

            return (
              <div key={project.id} className="project-card">
                {editingId === project.id ? (
                  <div className="project-card-edit-form">
                    <div className="input-row">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Nom du projet"
                      />
                      <button
                        type="button"
                        className="icon-btn icon-success"
                        onClick={() => updateProject(project.id)}
                      >
                        <FiCheck />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-danger"
                        onClick={() => setEditingId(null)}
                      >
                        <FiX />
                      </button>
                    </div>
                    <div className="input-row">
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* HEADER : icône + titre cliquable + actions */}
                    <div className="project-card-header">
                      <Link
                        to={`/project/${project.id}`}
                        className="project-card-folder-wrap"
                      >
                        <FiFolder className="project-card-folder" />
                      </Link>
                      <Link
                        to={`/project/${project.id}`}
                        className="project-card-title-link"
                      >
                        <h3 className="project-title">{project.title}</h3>
                      </Link>
                      <div className="actions">
                        {isOwner && (
                          <button
                            type="button"
                            className="icon-btn icon-primary"
                            onClick={() => {
                              setEditingId(project.id);
                              setEditTitle(project.title);
                              setEditDescription(project.description);
                            }}
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {isOwner && (
                          <button
                            type="button"
                            className="icon-btn icon-danger"
                            onClick={() => deleteProject(project.id)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* BODY : description */}
                    {project.description && (
                      <p className="project-card-desc">{project.description}</p>
                    )}

                    {/* FOOTER : badge rôle + avatars collabs + ajouter */}
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
                            onClick={() => setInviteProjectId(project.id)}
                            title="Inviter un collaborateur"
                          >
                            <img
                              src={logoAddCollab}
                              alt="Inviter un collaborateur"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </section>

        {inviteProjectId !== null && (
          <InviteCollaboratorModal
            projectId={inviteProjectId}
            onClose={() => setInviteProjectId(null)}
            onSuccess={fetchProjects}
          />
        )}
      </div>
    </div>
  );
}
