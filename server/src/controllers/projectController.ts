import type { RequestHandler } from "express";
import type { AuthRequest } from "../midllewares/verifyToken";
import projectRepository from "../models/projectRepository";
import type { IProject } from "../types/IProject";

const browse: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.id;

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const projects = await projectRepository.readAllByUser(userId);
    res.json(projects);
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

    const project = await projectRepository.read(id);

    if (!project) {
      res.status(404).json({ message: "Projet introuvable" });
      return;
    }

    res.json(project);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const add: RequestHandler = async (req, res) => {
  try {
    let { title, description, status, position } = req.body;

    const userId = (req as AuthRequest).user?.id;

    if (!title) {
      res.status(400).json({ message: "Titre requis" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    // valeurs par défaut
    description = description?.trim() || "";
    status = status || "todo";
    position = position ?? 0;

    const insertId = await projectRepository.create(
      {
        title,
        description,
        status,
        position,
      },
      userId,
    );

    res.status(201).json({
      id: insertId,
      title,
      description,
      status,
      position,
    });
  } catch (error) {
    console.error(error);
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

    const { title, description, status, position } = req.body;

    if (!title && !description && !status && position === undefined) {
      res.status(400).json({ message: "Aucune donnée à modifier" });
      return;
    }

    const affectedRows = await projectRepository.update(id, {
      title,
      description,
      status,
      position,
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: "Projet introuvable" });
      return;
    }

    res.json({ message: "Projet mis à jour" });
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

    const affectedRows = await projectRepository.delete(id);

    if (affectedRows === 0) {
      res.status(404).json({ message: "Projet introuvable" });
      return;
    }

    res.json({ message: "Projet supprimé" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export default { browse, read, add, edit, destroy };
