import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
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

    const fetchTasks = async () => {
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
    };

    fetchProject();
    fetchTasks();
  }, [projectId]);

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

  const handleCreateTask = async () => {
    if (!newTitle.trim()) {
      alert("Titre de tâche requis");
      return;
    }

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
        status: "todo",
        position: nextPosition,
        project_id: projectId,
      }),
    });

    if (!res.ok) {
      alert("Impossible de créer la tâche");
      return;
    }

    setNewTitle("");
    setNewContent("");

    const created = await res.json();
    if (created?.id) {
      setTasks((current) => [
        ...current,
        {
          id: created.id,
          title: newTitle,
          content: newContent,
          status: "todo",
          position: nextPosition,
          deadline: null,
          project_id: projectId,
        },
      ]);
    }

    const refresh = await fetch(
      `http://localhost:3310/api/tasks?project_id=${projectId}`,
      {
        credentials: "include",
      },
    );
    if (refresh.ok) {
      const refreshedData = await refresh.json();
      if (Array.isArray(refreshedData)) {
        setTasks(refreshedData.map(normalizeTask));
      }
    }
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
        <Link to="/profile">← Retour aux projets</Link>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
      </div>

      <div className="panel task-form">
        <h2>Nouvelle tâche</h2>
        <div className="input-row">
          <input
            type="text"
            placeholder="Titre de la tâche"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
          />
        </div>
        <div className="input-row">
          <input
            type="text"
            placeholder="Description (facultatif)"
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
          />
          <button
            type="button"
            className="icon-btn icon-success"
            onClick={handleCreateTask}
          >
            Ajouter
          </button>
        </div>
      </div>

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
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
