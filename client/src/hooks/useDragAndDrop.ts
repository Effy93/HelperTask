import {
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import type { ITask, TaskStatus } from "../../../server/src/types/ITask";

type ReorderFn = (
  updates: Array<{ id: number; status: TaskStatus; position: number }>,
) => Promise<void>;

export function useDragAndDrop(tasks: ITask[], onReorder: ReorderFn) {
  const [activeTask, setActiveTask] = useState<ITask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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

  const buildOrderedColumn = (status: TaskStatus) =>
    [...groupedTasks[status]].sort((a, b) => a.position - b.position);

  const findColumnForTask = (taskId: number): TaskStatus | null =>
    tasks.find((t) => t.id === taskId)?.status ?? null;

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
      const oldIndex = sourceItems.findIndex((t) => t.id === activeId);
      const newIndex = destItems.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const sorted = arrayMove(sourceItems, oldIndex, newIndex);
      await onReorder(
        sorted.map((t, i) => ({ id: t.id, status: t.status, position: i })),
      );
      return;
    }

    const movedTask = sourceItems.find((t) => t.id === activeId);
    if (!movedTask) return;

    const overIndex = destItems.findIndex((t) => t.id === overId);
    const destinationIndex = over.id.toString().startsWith("column-")
      ? destItems.length
      : overIndex === -1
        ? destItems.length
        : overIndex;

    const newSourceItems = sourceItems.filter((t) => t.id !== activeId);
    const newDestItems = [...destItems];
    newDestItems.splice(destinationIndex, 0, {
      ...movedTask,
      status: destinationStatus,
    });

    await onReorder([
      ...newSourceItems.map((t, i) => ({
        id: t.id,
        status: t.status,
        position: i,
      })),
      ...newDestItems.map((t, i) => ({
        id: t.id,
        status: destinationStatus,
        position: i,
      })),
    ]);
  };

  return {
    activeTask,
    sensors,
    closestCenter,
    groupedTasks,
    buildOrderedColumn,
    handleDragStart,
    handleDragEnd,
  };
}
