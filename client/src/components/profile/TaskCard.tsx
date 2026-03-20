import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ITask } from "../../../../server/src/types/ITask";

type Props = {
  task: ITask;
};

export default function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id.toString(), // ✅ dnd-kit → string
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
    >
      {task.title}
    </div>
  );
}
