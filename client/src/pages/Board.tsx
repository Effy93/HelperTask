import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCalendar, FiUser, FiUsers } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";

import type { ITask, TaskStatus } from "../../../server/src/types/ITask";

const API = import.meta.env.VITE_API_URL as string;
import logoAddCollab from "../assets/images/btn-addCollab.png";
import btnRetour from "../assets/images/btn-retour_projets.png";
import InviteCollaboratorModal from "../components/InviteCollaboratorModal";
import Column from "../components/profile/Column";
import type { Assignee } from "../components/profile/Column";
import TaskCard from "../components/profile/TaskCard";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

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

const projectStatusList: TaskStatus[] = ["todo", "doing", "done"];

type Project = {
  id_project: number;
  title: string;
  description: string;
};

type Collaborator = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const normalizeTask = (task: unknown): ITask => {
  const rawTask = task as Record<string, unknown>;

  return {
    id:
      typeof rawTask.id === "number"
        ? rawTask.id
        : Number(rawTask.id_task ?? rawTask.id),
    title: String(rawTask.title ?? ""),
    content: String(rawTask.content ?? ""),
    status: (rawTask.status as TaskStatus) ?? "todo",
    position: Number(rawTask.position ?? 0),
    deadline: rawTask.deadline ? String(rawTask.deadline) : null,
    project_id: Number(rawTask.project_id ?? rawTask.projectId ?? 0),
  };
};

export default function Board() {
  const { user, loading } = useAuth();
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<
    Record<number, Assignee[]>
  >({});
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [panelAssignees, setPanelAssignees] = useState<number[]>([]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo");
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const groupedTasks = useMemo(() => {
    const grouped: Record<TaskStatus, ITask[]> = {
      todo: [],
      doing: [],
      done: [],
    };

    return tasks.reduce((acc, task) => {
      acc[task.status].push(task);
      return acc;
    }, grouped);
  }, [tasks]);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);

    try {
      const res = await fetch(`${API}/api/tasks?project_id=${projectId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setTasks([]);
        return;
      }

      const data = await res.json();
      const loaded: ITask[] = Array.isArray(data)
        ? data.map(normalizeTask)
        : [];
      setTasks(loaded);

      const assigneeResults = await Promise.all(
        loaded.map(async (task) => {
          const r = await fetch(`${API}/api/tasks/${task.id}/assignees`, {
            credentials: "include",
          });
          if (!r.ok) return { taskId: task.id, assignees: [] as Assignee[] };
          const a = await r.json();
          return {
            taskId: task.id,
            assignees: Array.isArray(a) ? (a as Assignee[]) : [],
          };
        }),
      );

      const assigneesMap: Record<number, Assignee[]> = {};
      for (const { taskId, assignees } of assigneeResults) {
        assigneesMap[taskId] = assignees;
      }
      setTaskAssignees(assigneesMap);
    } catch {
      setTasks([]);
      setTaskAssignees({});
    } finally {
      setLoadingTasks(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (Number.isNaN(projectId)) return;

    const fetchProject = async () => {
      const res = await fetch(`${API}/api/projects/${projectId}`, {
        credentials: "include",
      });

      if (!res.ok) return;

      const projectData = await res.json();
      setProject(projectData);
    };

    const fetchCollaborators = async () => {
      const res = await fetch(
        `${API}/api/projects/${projectId}/collaborators`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const data = await res.json();
      setCollaborators(Array.isArray(data) ? data : []);
    };

    fetchProject();
    fetchTasks();
    fetchCollaborators();
  }, [projectId, fetchTasks]);

  const updateTaskOrder = async (
    updates: Array<{ id: number; status: TaskStatus; position: number }>,
  ) => {
    if (updates.length === 0) return;

    await fetch(`${API}/api/tasks/order`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks: updates }),
    });
  };

  const closeInviteModal = () => setShowInviteModal(false);

  const refreshCollaborators = async () => {
    const res = await fetch(`${API}/api/projects/${projectId}/collaborators`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setCollaborators(Array.isArray(data) ? data : []);
  };

  const closeTaskPanel = () => {
    setShowTaskPanel(false);
    setEditingTask(null);
    setNewTitle("");
    setNewContent("");
    setNewDeadline("");
    setPanelAssignees([]);
    setTaskStatus("todo");
  };

  const openTaskPanel = (task?: ITask) => {
    if (task) {
      setEditingTask(task);
      setNewTitle(task.title);
      setNewContent(task.content);
      setTaskStatus(task.status);
      setNewDeadline(task.deadline ? task.deadline.slice(0, 10) : "");
      setPanelAssignees((taskAssignees[task.id] ?? []).map((a) => a.id));
    } else {
      setEditingTask(null);
      setNewTitle("");
      setNewContent("");
      setNewDeadline("");
      setTaskStatus("todo");
      setPanelAssignees([]);
    }
    setShowTaskPanel(true);
  };

  const handleCreateOrUpdateTask = async () => {
    if (!newTitle.trim()) {
      alert("Titre de tâche requis");
      return;
    }

    if (editingTask) {
      const updatedTask = {
        title: newTitle,
        content: newContent,
        status: taskStatus,
        position: editingTask.position,
        deadline: newDeadline || null,
      };

      let destinationItems: ITask[] = [];

      if (editingTask.status !== taskStatus) {
        destinationItems = buildOrderedColumn(taskStatus);
        updatedTask.position = destinationItems.length;
      }

      const res = await fetch(`${API}/api/tasks/${editingTask.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!res.ok) {
        alert("Impossible de modifier la tâche");
        return;
      }

      const originalIds = (taskAssignees[editingTask.id] ?? []).map(
        (a) => a.id,
      );
      const toAdd = panelAssignees.filter((id) => !originalIds.includes(id));
      const toRemove = originalIds.filter((id) => !panelAssignees.includes(id));

      await Promise.all([
        ...toAdd.map((uid) =>
          fetch(`${API}/api/tasks/${editingTask.id}/assignees`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: uid }),
          }),
        ),
        ...toRemove.map((uid) =>
          fetch(`${API}/api/tasks/${editingTask.id}/assignees/${uid}`, {
            method: "DELETE",
            credentials: "include",
          }),
        ),
      ]);

      if (editingTask.status !== taskStatus) {
        const sourceItems = buildOrderedColumn(editingTask.status).filter(
          (task) => task.id !== editingTask.id,
        );
        const destItems = [
          ...destinationItems,
          {
            ...editingTask,
            status: taskStatus,
            position: destinationItems.length,
          },
        ];

        const sourceUpdates = sourceItems.map((task, index) => ({
          id: task.id,
          status: task.status,
          position: index,
        }));
        const destUpdates = destItems.map((task, index) => ({
          id: task.id,
          status: task.status,
          position: index,
        }));

        await updateTaskOrder([...sourceUpdates, ...destUpdates]);
      }
    } else {
      const nextPosition = groupedTasks.todo.length;

      const res = await fetch(`${API}/api/tasks`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          status: taskStatus,
          position: nextPosition,
          deadline: newDeadline || null,
          project_id: projectId,
        }),
      });

      if (!res.ok) {
        alert("Impossible de créer la tâche");
        return;
      }

      if (panelAssignees.length > 0) {
        const { id: newTaskId } = await res.json();
        await Promise.all(
          panelAssignees.map((uid) =>
            fetch(`${API}/api/tasks/${newTaskId}/assignees`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: uid }),
            }),
          ),
        );
      }
    }

    closeTaskPanel();
    await fetchTasks();
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<ITask>) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const body = {
      title: updates.title ?? task.title,
      content: updates.content ?? task.content,
      status: updates.status ?? task.status,
      position: updates.position ?? task.position,
      project_id: task.project_id,
    };

    const res = await fetch(`${API}/api/tasks/${taskId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      alert("Impossible de modifier la tâche");
      return;
    }

    if (updates.status && updates.status !== task.status) {
      const sourceItems = buildOrderedColumn(task.status).filter(
        (item) => item.id !== taskId,
      );
      const destItems = [
        ...buildOrderedColumn(updates.status),
        {
          ...task,
          status: updates.status,
          position: buildOrderedColumn(updates.status).length,
        },
      ];

      const sourceUpdates = sourceItems.map((item, index) => ({
        id: item.id,
        status: item.status,
        position: index,
      }));
      const destUpdates = destItems.map((item, index) => ({
        id: item.id,
        status: item.status,
        position: index,
      }));

      await updateTaskOrder([...sourceUpdates, ...destUpdates]);
    }

    await fetchTasks();
  };

  const handleChangeTaskStatus = async (taskId: number, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;

    await handleUpdateTask(taskId, { status });
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Supprimer cette tâche ?")) return;

    const res = await fetch(`${API}/api/tasks/${taskId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      alert("Impossible de supprimer la tâche");
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== taskId));
  };

  const findColumnForTask = (taskId: number): TaskStatus | null => {
    const task = tasks.find((item) => item.id === taskId);
    return task ? task.status : null;
  };

  const buildOrderedColumn = (status: TaskStatus) =>
    [...groupedTasks[status]].sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    setActiveTask(tasks.find((t) => t.id === taskId) ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    const sourceStatus = findColumnForTask(activeId);
    if (!sourceStatus) return;

    const destinationStatus = over.id.toString().startsWith("column-")
      ? (over.id.toString().replace("column-", "") as TaskStatus)
      : findColumnForTask(overId);

    if (!destinationStatus) return;

    const sourceItems = buildOrderedColumn(sourceStatus);
    const destItems = buildOrderedColumn(destinationStatus);

    if (sourceStatus === destinationStatus) {
      const oldIndex = sourceItems.findIndex((task) => task.id === activeId);
      const newIndex = destItems.findIndex((task) => task.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const sorted = arrayMove(sourceItems, oldIndex, newIndex);
      const updatedTasks = sorted.map((task, index) => ({
        id: task.id,
        status: task.status,
        position: index,
      }));

      setTasks((current) =>
        current.map((task) => {
          const update = updatedTasks.find((item) => item.id === task.id);
          return update ? { ...task, position: update.position } : task;
        }),
      );

      await updateTaskOrder(updatedTasks);
      return;
    }

    const movedTask = sourceItems.find((task) => task.id === activeId);
    if (!movedTask) return;

    const overIndex = destItems.findIndex((task) => task.id === overId);
    const destinationIndex = over.id.toString().startsWith("column-")
      ? destItems.length
      : overIndex === -1
        ? destItems.length
        : overIndex;

    const newSourceItems = sourceItems.filter((task) => task.id !== activeId);
    const newDestItems = [...destItems];

    const movedItem = { ...movedTask, status: destinationStatus };

    newDestItems.splice(destinationIndex, 0, movedItem);

    const sourceUpdates = newSourceItems.map((task, index) => ({
      id: task.id,
      status: task.status,
      position: index,
    }));
    const destUpdates = newDestItems.map((task, index) => ({
      id: task.id,
      status: task.status,
      position: index,
    }));

    setTasks((current) =>
      current.map((task) => {
        const update = [...sourceUpdates, ...destUpdates].find(
          (item) => item.id === task.id,
        );
        return update
          ? { ...task, status: update.status, position: update.position }
          : task;
      }),
    );

    await updateTaskOrder([...sourceUpdates, ...destUpdates]);
  };

  if (loading || loadingTasks) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" />;
  if (Number.isNaN(projectId) || !project) return <p>Projet introuvable.</p>;

  const po = collaborators.find((c) => c.role === "product_owner");
  const colabs = collaborators.filter((c) => c.role === "collaborator");
  // false seulement quand on sait avec certitude que l'utilisateur n'est pas PO
  const isOwner =
    collaborators.length === 0 ||
    (user !== null &&
      collaborators.some(
        (c) => c.id === user.id && c.role === "product_owner",
      ));

  return (
    <div className="board-page">
      <div className="profile-hero">
        <Link to="/profile" className="back-link">
          <img src={btnRetour} alt="Retour aux projets" />
        </Link>
        <div className="hero-center">
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
        <button
          type="button"
          className="add-task-toggle btn-animated"
          onClick={() => (showTaskPanel ? closeTaskPanel() : openTaskPanel())}
        >
          <span>+ Nouvelle tâche</span>
        </button>
      </div>

      <div className="board-layout">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="board">
            {projectStatusList.map((status) => (
              <Column
                key={status}
                id={status}
                title={
                  status === "todo"
                    ? "À faire"
                    : status === "doing"
                      ? "En cours"
                      : "Terminé"
                }
                tasks={buildOrderedColumn(status)}
                taskAssignees={taskAssignees}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
                onStatusChange={handleChangeTaskStatus}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                assignees={taskAssignees[activeTask.id] ?? []}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        <aside
          className={`task-drawer ${showTaskPanel ? "open" : ""}`}
          aria-expanded={showTaskPanel}
          aria-label="Panneau de tâche"
        >
          <div className="drawer-header">
            <div>
              <h2>{editingTask ? "Modifier la tâche" : "Nouvelle tâche"}</h2>
              <p>Renseigne le titre, la description et un collaborateur.</p>
            </div>
            <button
              type="button"
              className="drawer-close"
              onClick={closeTaskPanel}
              aria-label="Fermer le panneau"
            >
              ×
            </button>
          </div>

          <div className="drawer-body">
            <label>
              Titre
              <input
                type="text"
                placeholder="Titre de la tâche"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                placeholder="Description (facultatif)"
                value={newContent}
                onChange={(event) => setNewContent(event.target.value)}
              />
            </label>
            <label>
              Colonne
              <select
                value={taskStatus}
                onChange={(event) =>
                  setTaskStatus(event.target.value as TaskStatus)
                }
              >
                <option value="todo">À faire</option>
                <option value="doing">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </label>
            <div className="drawer-field">
              <span className="drawer-field-label">Assignés</span>
              {panelAssignees.length > 0 && (
                <div className="assignee-pills">
                  {panelAssignees.map((uid) => {
                    const collab = collaborators.find((c) => c.id === uid);
                    if (!collab) return null;
                    return (
                      <span key={uid} className="assignee-pill">
                        <span
                          className="avatar-circle assignee-pill-avatar"
                          style={{ background: getAvatarColor(uid) }}
                        >
                          {getInitials(collab.name)}
                        </span>
                        {collab.name}
                        <button
                          type="button"
                          className="assignee-pill-remove"
                          onClick={() =>
                            setPanelAssignees((prev) =>
                              prev.filter((id) => id !== uid),
                            )
                          }
                          aria-label={`Retirer ${collab.name}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
              {collaborators.filter((c) => !panelAssignees.includes(c.id))
                .length > 0 && (
                <select
                  value=""
                  onChange={(event) => {
                    const id = Number(event.target.value);
                    if (id) setPanelAssignees((prev) => [...prev, id]);
                  }}
                >
                  <option value="">+ Ajouter un collaborateur</option>
                  {collaborators
                    .filter((c) => !panelAssignees.includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              )}
            </div>
            <label>
              Deadline
              <input
                type="date"
                value={newDeadline}
                onChange={(event) => setNewDeadline(event.target.value)}
              />
            </label>
            <div className="drawer-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={closeTaskPanel}
              >
                Annuler
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleCreateOrUpdateTask}
              >
                {editingTask ? "Enregistrer" : "Créer la tâche"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <section className="board-info">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Légende</h3>
          <div className="sidebar-legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot--todo" />
              <span>À faire</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--doing" />
              <span>En cours</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--done" />
              <span>Terminé</span>
            </div>
            <div className="legend-item">
              <FiCalendar className="legend-icon" />
              <span>Deadline</span>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Collaborateurs</h3>
          <div className="sidebar-collabs">
            {collaborators.map((c) => (
              <div key={c.id} className="sidebar-collab">
                <span
                  className="avatar-circle avatar-circle--md"
                  style={{ background: getAvatarColor(c.id) }}
                >
                  {getInitials(c.name)}
                </span>
                <span className="sidebar-collab-info">
                  <span className="sidebar-collab-name">{c.name}</span>
                  {c.role === "product_owner" && (
                    <span className="badge-po">PO</span>
                  )}
                </span>
              </div>
            ))}
            {isOwner && (
              <div className="sidebar-collab">
                <button
                  type="button"
                  className="add-collab-btn add-collab-btn--md"
                  onClick={() => setShowInviteModal(true)}
                  title="Inviter un collaborateur"
                >
                  <img src={logoAddCollab} alt="Inviter un collaborateur" />
                </button>
                <span className="sidebar-collab-name add-collab-label">
                  Inviter un collaborateur
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {showInviteModal && (
        <InviteCollaboratorModal
          projectId={projectId}
          onClose={closeInviteModal}
          onSuccess={refreshCollaborators}
        />
      )}
    </div>
  );
}
