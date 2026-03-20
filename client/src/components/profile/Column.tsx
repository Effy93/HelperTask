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
};

export default function Column({ title, tasks }: Props) {
  return (
    <div className="column">
      <h2>{title}</h2>

      <SortableContext
        items={tasks.map((t) => t.id.toString())} // ✅ string
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}
