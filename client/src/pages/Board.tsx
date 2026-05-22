import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import type { ITask, TaskStatus } from "../../../server/src/types/ITask";
import InviteCollaboratorModal from "../components/InviteCollaboratorModal";
import BoardColumns from "../components/board/BoardColumns";
import BoardHeader from "../components/board/BoardHeader";
import BoardSidebar from "../components/board/BoardSidebar";
import TaskDrawer from "../components/board/TaskDrawer";
import { useAuth } from "../context/AuthContext";
import { useCollaborators } from "../hooks/useCollaborators";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useTasks } from "../hooks/useTasks";
import { fetchProject } from "../services/projectService";
import { updateTask } from "../services/taskService";
import "../styles/profile.css";
import "../components/board/board.css";

type Project = { id_project: number; title: string; description: string };

export default function Board() {
  const { user, loading } = useAuth();
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [panelTitle, setPanelTitle] = useState("");
  const [panelContent, setPanelContent] = useState("");
  const [panelStatus, setPanelStatus] = useState<TaskStatus>("todo");
  const [panelDeadline, setPanelDeadline] = useState("");
  const [panelAssignees, setPanelAssignees] = useState<number[]>([]);

  const {
    tasks,
    taskAssignees,
    loading: loadingTasks,
    refresh: refreshTasks,
    create: createTask,
    update: updateTaskHook,
    remove: removeTask,
    reorder,
  } = useTasks(projectId);

  const { collaborators, refresh: refreshCollaborators } =
    useCollaborators(projectId);

  const {
    activeTask,
    sensors,
    buildOrderedColumn,
    handleDragStart,
    handleDragEnd,
  } = useDragAndDrop(tasks, reorder);

  useEffect(() => {
    if (Number.isNaN(projectId)) return;
    fetchProject(projectId)
      .then(setProject)
      .catch(() => null);
  }, [projectId]);

  const openTaskPanel = (task?: ITask) => {
    if (task) {
      setEditingTask(task);
      setPanelTitle(task.title);
      setPanelContent(task.content);
      setPanelStatus(task.status);
      setPanelDeadline(task.deadline ? task.deadline.slice(0, 10) : "");
      setPanelAssignees((taskAssignees[task.id] ?? []).map((a) => a.id));
    } else {
      setEditingTask(null);
      setPanelTitle("");
      setPanelContent("");
      setPanelStatus("todo");
      setPanelDeadline("");
      setPanelAssignees([]);
    }
    setShowTaskPanel(true);
  };

  const closeTaskPanel = () => {
    setShowTaskPanel(false);
    setEditingTask(null);
  };

  const handleSubmitTask = async () => {
    if (!panelTitle.trim()) {
      alert("Titre de tâche requis");
      return;
    }
    if (editingTask) {
      const statusChanged = editingTask.status !== panelStatus;
      const newPosition = statusChanged
        ? buildOrderedColumn(panelStatus).length
        : editingTask.position;

      await updateTaskHook(
        editingTask,
        {
          title: panelTitle,
          content: panelContent,
          status: panelStatus,
          position: newPosition,
          deadline: panelDeadline || null,
          project_id: editingTask.project_id,
        },
        panelAssignees,
      );

      if (statusChanged) {
        const sourceUpdates = buildOrderedColumn(editingTask.status)
          .filter((t) => t.id !== editingTask.id)
          .map((t, i) => ({ id: t.id, status: t.status, position: i }));
        const destUpdates = [
          ...buildOrderedColumn(panelStatus),
          { ...editingTask, status: panelStatus, position: newPosition },
        ].map((t, i) => ({ id: t.id, status: panelStatus, position: i }));
        await reorder([...sourceUpdates, ...destUpdates]);
      }
    } else {
      await createTask(
        {
          title: panelTitle,
          content: panelContent,
          status: panelStatus,
          position: buildOrderedColumn(panelStatus).length,
          deadline: panelDeadline || null,
          project_id: projectId,
        },
        panelAssignees,
      );
    }
    closeTaskPanel();
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<ITask>) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await updateTask(taskId, {
      title: updates.title ?? task.title,
      content: updates.content ?? task.content,
      status: updates.status ?? task.status,
      position: updates.position ?? task.position,
      project_id: task.project_id,
    });
    await refreshTasks();
  };

  const handleChangeTaskStatus = async (taskId: number, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;

    const newPosition = buildOrderedColumn(status).length;
    await updateTask(taskId, {
      title: task.title,
      content: task.content,
      status,
      position: newPosition,
      project_id: task.project_id,
    });

    const sourceUpdates = buildOrderedColumn(task.status)
      .filter((t) => t.id !== taskId)
      .map((t, i) => ({ id: t.id, status: t.status, position: i }));
    const destUpdates = [
      ...buildOrderedColumn(status),
      { ...task, status, position: newPosition },
    ].map((t, i) => ({ id: t.id, status, position: i }));
    await reorder([...sourceUpdates, ...destUpdates]);

    await refreshTasks();
  };

  const isOwner =
    collaborators.length === 0 ||
    (user !== null &&
      collaborators.some(
        (c) => c.id === user.id && c.role === "product_owner",
      ));

  if (loading || loadingTasks) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" />;
  if (Number.isNaN(projectId) || !project) return <p>Projet introuvable.</p>;

  return (
    <div className="board-page">
      <BoardHeader
        project={project}
        collaborators={collaborators}
        onNewTask={() => (showTaskPanel ? closeTaskPanel() : openTaskPanel())}
      />

      <div className="board-layout">
        <BoardColumns
          activeTask={activeTask}
          sensors={sensors}
          buildOrderedColumn={buildOrderedColumn}
          taskAssignees={taskAssignees}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDelete={removeTask}
          onUpdate={handleUpdateTask}
          onStatusChange={handleChangeTaskStatus}
        />
        <TaskDrawer
          open={showTaskPanel}
          editingTask={editingTask}
          title={panelTitle}
          content={panelContent}
          status={panelStatus}
          deadline={panelDeadline}
          assigneeIds={panelAssignees}
          collaborators={collaborators}
          onChangeTitle={setPanelTitle}
          onChangeContent={setPanelContent}
          onChangeStatus={setPanelStatus}
          onChangeDeadline={setPanelDeadline}
          onAddAssignee={(id) => setPanelAssignees((prev) => [...prev, id])}
          onRemoveAssignee={(id) =>
            setPanelAssignees((prev) => prev.filter((x) => x !== id))
          }
          onSubmit={handleSubmitTask}
          onClose={closeTaskPanel}
        />
      </div>

      <BoardSidebar
        collaborators={collaborators}
        isOwner={isOwner}
        onInvite={() => setShowInviteModal(true)}
      />

      {showInviteModal && (
        <InviteCollaboratorModal
          projectId={projectId}
          onClose={() => setShowInviteModal(false)}
          onSuccess={refreshCollaborators}
        />
      )}
    </div>
  );
}
