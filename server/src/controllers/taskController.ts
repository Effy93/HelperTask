import type { RequestHandler } from "express";
import taskRepository from "../models/taskRepository";
import type { ITask } from "../types/ITask";

const browse: RequestHandler = async (req, res) => {
  try {
    const projectIdParam = req.query.project_id;
    let projectId: number | undefined = undefined;

    if (projectIdParam !== undefined) {
      projectId = Number(projectIdParam);

      if (Number.isNaN(projectId)) {
        res.status(400).json({ message: "ID de projet invalide" });
        return;
      }
    }

    const tasks = await taskRepository.readAll(projectId);
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const reorder: RequestHandler = async (req, res) => {
  try {
    const updates = req.body.tasks;

    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ message: "Aucune tâche à mettre à jour" });
      return;
    }

    const sanitizedUpdates = updates.map((task: unknown) => {
      if (typeof task !== "object" || task === null) {
        throw new Error("Données de tâche invalides");
      }

      const { id, status, position } = task as Record<string, unknown>;

      return {
        id: Number(id),
        status: status as ITask["status"],
        position: Number(position),
      };
    });

    const affectedRows = await taskRepository.updateMany(sanitizedUpdates);

    if (affectedRows === 0) {
      res.status(404).json({ message: "Aucune tâche mise à jour" });
      return;
    }

    res.json({ message: "Ordre des tâches mis à jour" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const read: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const task = await taskRepository.read(id);

    if (!task) {
      res.status(404).json({ message: "Task introuvable" });
      return;
    }

    res.json(task);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const add: RequestHandler = async (req, res) => {
  try {
    const { title, content, status, position, deadline, project_id } = req.body;

    if (!title || !status || !project_id) {
      res.status(400).json({ message: "Champs requis" });
      return;
    }

    const newTask: Omit<ITask, "id"> = {
      title,
      content: content ?? "",
      status,
      position: position ?? 0,
      deadline: deadline ?? null,
      project_id,
    };

    const insertId = await taskRepository.create(newTask);

    res.status(201).json({ id: insertId });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const edit: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const { title, content, status, position, deadline, project_id } = req.body;

    if (
      !title &&
      !content &&
      !status &&
      position === undefined &&
      !deadline &&
      !project_id
    ) {
      res.status(400).json({ message: "Aucune donnée à modifier" });
      return;
    }

    const affectedRows = await taskRepository.update(id, {
      title,
      content,
      status,
      position,
      deadline,
      project_id,
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: "Task introuvable" });
      return;
    }

    res.json({ message: "Task mise à jour" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const destroy: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const affectedRows = await taskRepository.delete(id);

    if (affectedRows === 0) {
      res.status(404).json({ message: "Task introuvable" });
      return;
    }

    res.json({ message: "Task supprimée" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export default { browse, read, add, edit, reorder, destroy };
