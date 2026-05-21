import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL as string;
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

import { FiCheck, FiEdit2, FiFolder, FiTrash2, FiX } from "react-icons/fi";

type Project = {
  id: number;
  title: string;
  description: string;
};

type ApiProject = {
  id_project: number;
  title: string;
  description: string;
};

export default function Profile() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch(`${API}/api/projects`, {
      credentials: "include",
    });
    const data = await res.json();
    const formatted = Array.isArray(data)
      ? (data as ApiProject[]).map((p) => ({
          id: p.id_project,
          title: p.title,
          description: p.description,
        }))
      : [];
    setProjects(formatted);
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
    <div className="profile-content">
      {/* CREATE */}
      <section id="create" className="profile-panel">
        <h2 className="panel-title">Créer un projet</h2>

        <div className="input-field">
          <label htmlFor="project-title" className="sr-only">Nom du projet</label>
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
          <label htmlFor="project-description" className="sr-only">Description</label>
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

        {projects.map((project) => (
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
                </div>
                <div className="input-row">
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                  />
                  <button
                    type="button"
                    className="icon-btn icon-danger"
                    onClick={() => setEditingId(null)}
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to={`/project/${project.id}`}
                  className="project-card-folder-wrap"
                >
                  <FiFolder className="project-card-folder" />
                </Link>

                <div className="project-card-body">
                  <Link to={`/project/${project.id}`}>
                    <h3 className="project-title">{project.title}</h3>
                  </Link>
                  <p className="project-card-desc">{project.description}</p>
                </div>

                <div className="actions">
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
                  <button
                    type="button"
                    className="icon-btn icon-danger"
                    onClick={() => deleteProject(project.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
