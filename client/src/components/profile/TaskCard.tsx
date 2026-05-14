import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiTrash2 } from "react-icons/fi";
import type { ITask } from "../../../../server/src/types/ITask";

type Props = {
  task: ITask;
  onDelete?: (taskId: number) => void;
};

export default function TaskCard({ task, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id.toString(),
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
      <div className="task-card-content">
        <strong>{task.title}</strong>
        {task.content && <p>{task.content}</p>}
      </div>

      {onDelete && (
        <button
          type="button"
          className="task-card-delete"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(task.id);
          }}
          aria-label="Supprimer la tâche"
        >
          <FiTrash2 />
        </button>
      )}
    </div>
  );
}
