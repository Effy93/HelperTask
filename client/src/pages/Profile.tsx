import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("http://localhost:3310/api/projects", {
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

    const res = await fetch("http://localhost:3310/api/projects", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
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
    const res = await fetch(`http://localhost:3310/api/projects/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
      }),
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

    const res = await fetch(`http://localhost:3310/api/projects/${id}`, {
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
    <div className="profile-container">
      <h1>Bienvenue {user.name}</h1>

      <h2>Créer un projet</h2>

      <input
        type="text"
        placeholder="Nom du projet"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="button" className="btn btn-success" onClick={createProject}>
        Créer
      </button>

      <h2>Mes projets</h2>

      {projects.map((project) => (
        <div key={project.id} className="project-card">
          {editingId === project.id ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => updateProject(project.id)}
                >
                  Valider
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setEditingId(null)}
                >
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to={`/project/${project.id}`}>
                <h3>{project.title}</h3>
              </Link>

              <p>{project.description}</p>

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingId(project.id);
                    setEditTitle(project.title);
                    setEditDescription(project.description);
                  }}
                >
                  Modifier
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => deleteProject(project.id)}
                >
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
