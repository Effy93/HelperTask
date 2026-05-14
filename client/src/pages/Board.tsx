import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import type { ITask, TaskStatus } from "../../../server/src/types/ITask";
import Column from "../components/profile/Column";
import { useAuth } from "../context/AuthContext";

const projectStatusList: TaskStatus[] = ["todo", "doing", "done"];

type Project = {
  id_project: number;
  title: string;
  description: string;
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
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCollaborator, setNewCollaborator] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo");
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);

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
      const res = await fetch(
        `http://localhost:3310/api/tasks?project_id=${projectId}`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        setTasks([]);
        return;
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data.map(normalizeTask) : []);
    } catch {
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (Number.isNaN(projectId)) return;

    const fetchProject = async () => {
      const res = await fetch(
        `http://localhost:3310/api/projects/${projectId}`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) return;

      const projectData = await res.json();
      setProject(projectData);
    };

    fetchProject();
    fetchTasks();
  }, [projectId, fetchTasks]);

  const updateTaskOrder = async (
    updates: Array<{ id: number; status: TaskStatus; position: number }>,
  ) => {
    if (updates.length === 0) return;

    await fetch("http://localhost:3310/api/tasks/order", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks: updates }),
    });
  };

  const closeTaskPanel = () => {
    setShowTaskPanel(false);
    setEditingTask(null);
    setNewTitle("");
    setNewContent("");
    setNewCollaborator("");
    setTaskStatus("todo");
  };

  const openTaskPanel = (task?: ITask) => {
    if (task) {
      setEditingTask(task);
      setNewTitle(task.title);
      setNewContent(task.content);
      setTaskStatus(task.status);
      setNewCollaborator("");
    } else {
      setEditingTask(null);
      setNewTitle("");
      setNewContent("");
      setTaskStatus("todo");
      setNewCollaborator("");
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
      };

      let destinationItems: ITask[] = [];

      if (editingTask.status !== taskStatus) {
        destinationItems = buildOrderedColumn(taskStatus);
        updatedTask.position = destinationItems.length;
      }

      const res = await fetch(
        `http://localhost:3310/api/tasks/${editingTask.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        },
      );

      if (!res.ok) {
        alert("Impossible de modifier la tâche");
        return;
      }

      if (editingTask.status !== taskStatus) {
        const sourceItems = buildOrderedColumn(editingTask.status).filter(
          (task) => task.id !== editingTask.id,
        );
        const destItems = [
          ...destinationItems,
          { ...editingTask, status: taskStatus, position: destinationItems.length },
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

      const res = await fetch("http://localhost:3310/api/tasks", {
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
          project_id: projectId,
        }),
      });

      if (!res.ok) {
        alert("Impossible de créer la tâche");
        return;
      }
    }

    closeTaskPanel();
    await fetchTasks();
  };

  const handleUpdateTask = async (
    taskId: number,
    updates: Partial<ITask>,
  ) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const body = {
      title: updates.title ?? task.title,
      content: updates.content ?? task.content,
      status: updates.status ?? task.status,
      position: updates.position ?? task.position,
      project_id: task.project_id,
    };

    const res = await fetch(`http://localhost:3310/api/tasks/${taskId}`, {
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
      const destItems = [...buildOrderedColumn(updates.status), { ...task, status: updates.status, position: buildOrderedColumn(updates.status).length }];

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

  const handleChangeTaskStatus = async (
    taskId: number,
    status: TaskStatus,
  ) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;

    await handleUpdateTask(taskId, { status });
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Supprimer cette tâche ?")) return;

    const res = await fetch(`http://localhost:3310/api/tasks/${taskId}`, {
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

  const handleDragEnd = async (event: DragEndEvent) => {
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

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div>
          <Link to="/profile">← Retour aux projets</Link>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
        <button
          type="button"
          className="add-task-toggle"
          onClick={() => openTaskPanel()}
        >
          + Nouvelle tâche
        </button>
      </div>

      <div className="board-layout">
        <aside className={`task-drawer ${showTaskPanel ? "open" : ""}`}>
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
              Collaborateur
              <input
                type="text"
                placeholder="Nom du collaborateur"
                value={newCollaborator}
                onChange={(event) => setNewCollaborator(event.target.value)}
              />
            </label>
            <label>
              Statut
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
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
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
                onStatusChange={handleChangeTaskStatus}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
