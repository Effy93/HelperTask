import { useState } from "react";
import { Navigate } from "react-router-dom";
import InviteCollaboratorModal from "../components/InviteCollaboratorModal";
import ProfileHero from "../components/profile-page/ProfileHero";
import ProjectCard from "../components/profile-page/ProjectCard";
import ProjectCreator from "../components/profile-page/ProjectCreator";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../hooks/useProjects";
import "../styles/profile.css";

export default function Profile() {
  const { user, loading, setUser } = useAuth();
  const { projects, projectCollaborators, refresh, create, update, remove } =
    useProjects();
  const [inviteProjectId, setInviteProjectId] = useState<number | null>(null);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="profile-page">
      <ProfileHero
        user={user}
        onUserUpdated={(updated) => setUser({ ...user, ...updated })}
      />

      <div className="profile-content">
        <ProjectCreator onCreate={create} />

        <section id="projects" className="profile-panel">
          <h2 className="panel-title">Mes projets</h2>

          {projects.length === 0 && (
            <p className="projects-empty">Aucun projet pour l'instant.</p>
          )}

          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              collaborators={projectCollaborators[project.id] ?? []}
              onUpdate={update}
              onDelete={remove}
              onInvite={setInviteProjectId}
            />
          ))}
        </section>
      </div>

      {inviteProjectId !== null && (
        <InviteCollaboratorModal
          projectId={inviteProjectId}
          onClose={() => setInviteProjectId(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
