import { useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";

type Props = {
  onCreate: (title: string, description: string) => Promise<void>;
};

export default function ProjectCreator({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Titre requis");
      return;
    }
    await onCreate(title, description);
    setTitle("");
    setDescription("");
    titleRef.current?.focus();
  };

  return (
    <section id="create" className="profile-panel">
      <h2 className="panel-title">Créer un projet</h2>

      <div className="input-field">
        <label htmlFor="project-title" className="sr-only">
          Nom du projet
        </label>
        <input
          id="project-title"
          ref={titleRef}
          type="text"
          placeholder="Nom du projet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
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
          onClick={handleCreate}
        >
          <span>Créer le projet</span>
        </button>
      </div>
    </section>
  );
}
