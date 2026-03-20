import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Project = {
  id: number;
  title: string;
  description: string;
};

export default function Profile() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:3310/api/projects", {
        credentials: "include",
      });
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    };

    load();
  }, []);

  const createProject = async () => {
    const res = await fetch("http://localhost:3310/api/projects", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    if (!res.ok) {
      alert("Erreur création projet");
      return;
    }

    const newProject = await res.json();

    setProjects((prev) => [...prev, newProject]);
    setTitle("");
    setDescription("");
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div>
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

      <button type="button" onClick={createProject}>
        Créer
      </button>

      <h2>Mes projets</h2>

      {projects.map((project) => (
        <div key={project.id}>
          <Link to={`/project/${project.id}`}>
            <h3>{project.title}</h3>
          </Link>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
}
