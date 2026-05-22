import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  closestCenter,
  type useSensors,
} from "@dnd-kit/core";
import type { ITask, TaskStatus } from "../../../../server/src/types/ITask";
import type { Assignee } from "../../services/taskService";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "../../utils/taskStatus";
import Column from "../profile/Column";
import TaskCard from "../profile/TaskCard";

type Props = {
  activeTask: ITask | null;
  sensors: ReturnType<typeof useSensors>;
  buildOrderedColumn: (status: TaskStatus) => ITask[];
  taskAssignees: Record<number, Assignee[]>;
  onDragStart: (e: DragStartEvent) => void;
  onDragEnd: (e: DragEndEvent) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<ITask>) => Promise<void>;
  onStatusChange: (id: number, status: TaskStatus) => Promise<void>;
};

export default function BoardColumns({
  activeTask,
  sensors,
  buildOrderedColumn,
  taskAssignees,
  onDragStart,
  onDragEnd,
  onDelete,
  onUpdate,
  onStatusChange,
}: Props) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="board">
        {TASK_STATUSES.map((status) => (
          <Column
            key={status}
            id={status}
            title={TASK_STATUS_LABELS[status]}
            tasks={buildOrderedColumn(status)}
            taskAssignees={taskAssignees}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onStatusChange={onStatusChange}
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
  );
}
