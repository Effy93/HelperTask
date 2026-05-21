import type { RequestHandler } from "express";
import type { AuthRequest } from "../midllewares/verifyToken";
import projectRepository from "../models/projectRepository";
import userRepository from "../models/userRepository";
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
    const userId = (req as AuthRequest).user?.id;
    const title = String(req.body.title ?? "").trim();
    const description = String(req.body.description ?? "").trim();
    const status = req.body.status || "todo";
    const position = req.body.position ?? 0;

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    if (!title) {
      res.status(400).json({ message: "Titre requis" });
      return;
    }
    if (title.length > 100) {
      res.status(400).json({ message: "Titre trop long (100 caractères max)" });
      return;
    }
    if (description.length > 255) {
      res
        .status(400)
        .json({ message: "Description trop longue (255 caractères max)" });
      return;
    }

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
    const userId = (req as AuthRequest).user?.id;

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const owner = await projectRepository.isOwner(id, userId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }

    const { title, description, status, position } = req.body;

    if (title !== undefined && title.trim() === "") {
      res.status(400).json({ message: "Titre requis" });
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
    const userId = (req as AuthRequest).user?.id;

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const owner = await projectRepository.isOwner(id, userId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
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

const getCollaborators: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }
    const collaborators = await projectRepository.getCollaborators(id);
    res.json(collaborators);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const addCollaborator: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = (req as AuthRequest).user?.id;
    const email = String(req.body.email ?? "").trim();

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }
    if (!email) {
      res.status(400).json({ message: "Email requis" });
      return;
    }

    const owner = await projectRepository.isOwner(id, userId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }

    const [targetUser] = await userRepository.getByEmail(email);
    if (!targetUser) {
      res.status(404).json({ message: "Aucun compte trouvé avec cet email" });
      return;
    }
    if (targetUser.id === userId) {
      res.status(400).json({ message: "Vous êtes déjà membre de ce projet" });
      return;
    }

    await projectRepository.addCollaborator(id, targetUser.id);
    res.status(201).json({ message: "Collaborateur ajouté" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateCollaboratorRole: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = (req as AuthRequest).user?.id;
    const targetUserId = Number(req.params.userId);
    const { role } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }
    if (Number.isNaN(id) || Number.isNaN(targetUserId)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }
    if (!["product_owner", "collaborator"].includes(role)) {
      res
        .status(400)
        .json({ message: "Rôle invalide (product_owner ou collaborator)" });
      return;
    }

    const owner = await projectRepository.isOwner(id, userId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }
    if (targetUserId === userId && role === "collaborator") {
      res
        .status(403)
        .json({ message: "Vous ne pouvez pas vous rétrograder vous-même" });
      return;
    }

    const affected = await projectRepository.updateCollaboratorRole(
      id,
      targetUserId,
      role,
    );
    if (affected === 0) {
      res.status(404).json({ message: "Collaborateur introuvable" });
      return;
    }

    res.json({ message: "Rôle mis à jour" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const removeCollaborator: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = (req as AuthRequest).user?.id;
    const targetUserId = Number(req.params.userId);

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }
    if (Number.isNaN(id) || Number.isNaN(targetUserId)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const owner = await projectRepository.isOwner(id, userId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }

    const affected = await projectRepository.removeCollaborator(
      id,
      targetUserId,
    );
    if (affected === 0) {
      res.status(404).json({ message: "Collaborateur introuvable" });
      return;
    }
    res.json({ message: "Collaborateur retiré" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export default {
  browse,
  read,
  add,
  edit,
  destroy,
  getCollaborators,
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
};
