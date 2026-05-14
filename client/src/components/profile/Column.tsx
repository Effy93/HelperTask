import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { ITask } from "../../../../server/src/types/ITask";
import TaskCard from "./TaskCard";

type Props = {
  id: string;
  title: string;
  tasks: ITask[];
  onDelete?: (taskId: number) => void;
};

export default function Column({ id, title, tasks, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${id}` });

  return (
    <div
      ref={setNodeRef}
      className={`column ${isOver ? "column-over" : ""}`}
      data-column-id={id}
    >
      <h2>{title}</h2>

      <SortableContext
        items={tasks.map((t) => t.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDelete} />
        ))}
      </SortableContext>
    </div>
  );
}
