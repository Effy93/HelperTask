import type { RequestHandler } from "express";
import type { AuthRequest } from "../middlewares/verifyToken";
import projectRepository from "../models/projectRepository";
import userRepository from "../models/userRepository";

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
    const role =
      req.body.role === "product_owner" ? "product_owner" : "collaborator";

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

    await projectRepository.addCollaborator(id, targetUser.id, role);
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
  getCollaborators,
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
};
