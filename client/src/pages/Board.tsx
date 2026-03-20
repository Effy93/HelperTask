import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import { useEffect, useState } from "react";

import { arrayMove } from "@dnd-kit/sortable";

import type { ITask, TaskStatus } from "../../../server/src/types/ITask";
import Column from "../components/profile/Column";

type Columns = {
  todo: ITask[];
  doing: ITask[];
  done: ITask[];
};

export default function Board() {
  const [columns, setColumns] = useState<Columns>({
    todo: [],
    doing: [],
    done: [],
  });

  const [loading, setLoading] = useState(true);

  // 🔄 FETCH
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:3310/api/tasks", {
          credentials: "include",
        });

        if (!res.ok) {
          setColumns({ todo: [], doing: [], done: [] });
          return;
        }

        const data = await res.json();

        const grouped: Columns = {
          todo: [],
          doing: [],
          done: [],
        };

        for (const task of data.tasks as ITask[]) {
          if (task.status === "todo") grouped.todo.push(task);
          if (task.status === "doing") grouped.doing.push(task);
          if (task.status === "done") grouped.done.push(task);
        }

        setColumns(grouped);
      } catch {
        setColumns({ todo: [], doing: [], done: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 🔥 DRAG & DROP
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    if (activeId === overId) return;

    let sourceColumn: keyof Columns | null = null;
    let destColumn: keyof Columns | null = null;

    const keys = Object.keys(columns) as (keyof Columns)[];

    for (const key of keys) {
      const col = columns[key];

      if (col.find((t) => t.id === activeId)) {
        sourceColumn = key;
      }

      if (col.find((t) => t.id === overId)) {
        destColumn = key;
      }
    }

    if (!sourceColumn || !destColumn) return;

    // 📦 même colonne → reorder
    if (sourceColumn === destColumn) {
      const col = columns[sourceColumn];

      const oldIndex = col.findIndex((t) => t.id === activeId);
      const newIndex = col.findIndex((t) => t.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = arrayMove(col, oldIndex, newIndex);

      setColumns({
        ...columns,
        [sourceColumn]: newItems,
      });

      return;
    }

    // 🔄 changement de colonne
    const sourceItems = [...columns[sourceColumn]];
    const destItems = [...columns[destColumn]];

    const taskIndex = sourceItems.findIndex((t) => t.id === activeId);

    if (taskIndex === -1) return;

    const [movedTask] = sourceItems.splice(taskIndex, 1);

    // ⚠️ status cohérent avec backend
    movedTask.status = destColumn as TaskStatus;

    destItems.push(movedTask);

    setColumns({
      ...columns,
      [sourceColumn]: sourceItems,
      [destColumn]: destItems,
    });
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="board">
        <Column id="todo" title="À faire" tasks={columns.todo} />
        <Column id="doing" title="En cours" tasks={columns.doing} />
        <Column id="done" title="Terminé" tasks={columns.done} />
      </div>
    </DndContext>
  );
}
