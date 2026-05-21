import type { RequestHandler } from "express";
import type { AuthRequest } from "../midllewares/verifyToken";
import projectRepository from "../models/projectRepository";
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

const VALID_STATUSES: ITask["status"][] = ["todo", "doing", "done"];

const add: RequestHandler = async (req, res) => {
  try {
    const title = String(req.body.title ?? "").trim();
    const content = String(req.body.content ?? "").trim();
    const status = req.body.status as ITask["status"];
    const position = req.body.position ?? 0;
    const deadline = req.body.deadline ?? null;
    const project_id = Number(req.body.project_id);

    if (!title) {
      res.status(400).json({ message: "Titre requis" });
      return;
    }
    if (title.length > 100) {
      res.status(400).json({ message: "Titre trop long (100 caractères max)" });
      return;
    }
    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({ message: "Statut invalide" });
      return;
    }
    if (Number.isNaN(project_id)) {
      res.status(400).json({ message: "project_id invalide" });
      return;
    }

    const newTask: Omit<ITask, "id"> = {
      title,
      content,
      status,
      position,
      deadline,
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
    const userId = (req as AuthRequest).user?.id;

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const task = await taskRepository.read(id);
    if (!task) {
      res.status(404).json({ message: "Tâche introuvable" });
      return;
    }

    const owner = await projectRepository.isOwner(task.project_id, userId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
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
      res.status(404).json({ message: "Tâche introuvable" });
      return;
    }

    res.json({ message: "Tâche mise à jour" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const destroy: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = (req as AuthRequest).user?.id;

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const task = await taskRepository.read(id);
    if (!task) {
      res.status(404).json({ message: "Tâche introuvable" });
      return;
    }

    const owner = await projectRepository.isOwner(task.project_id, userId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }

    const affectedRows = await taskRepository.delete(id);

    if (affectedRows === 0) {
      res.status(404).json({ message: "Tâche introuvable" });
      return;
    }

    res.json({ message: "Tâche supprimée" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getAssignees: RequestHandler = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    if (Number.isNaN(taskId)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }
    const assignees = await taskRepository.getAssignees(taskId);
    res.json(assignees);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const assignUser: RequestHandler = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const userId = Number(req.body.user_id);
    const requesterId = (req as AuthRequest).user?.id;

    if (!requesterId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }
    if (Number.isNaN(taskId) || Number.isNaN(userId)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const task = await taskRepository.read(taskId);
    if (!task) {
      res.status(404).json({ message: "Tâche introuvable" });
      return;
    }

    const owner = await projectRepository.isOwner(task.project_id, requesterId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }

    await taskRepository.assignUser(taskId, userId);
    res.status(201).json({ message: "Utilisateur assigné" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const unassignUser: RequestHandler = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const requesterId = (req as AuthRequest).user?.id;

    if (!requesterId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }
    if (Number.isNaN(taskId) || Number.isNaN(userId)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const task = await taskRepository.read(taskId);
    if (!task) {
      res.status(404).json({ message: "Tâche introuvable" });
      return;
    }

    const owner = await projectRepository.isOwner(task.project_id, requesterId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }

    await taskRepository.unassignUser(taskId, userId);
    res.json({ message: "Utilisateur retiré" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export default { browse, read, add, edit, reorder, destroy, getAssignees, assignUser, unassignUser };
