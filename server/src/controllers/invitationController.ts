import crypto from "node:crypto";
import type { RequestHandler } from "express";
import type { AuthRequest } from "../midllewares/verifyToken";
import invitationRepository from "../models/invitationRepository";
import projectRepository from "../models/projectRepository";
import userRepository from "../models/userRepository";
import { sendInvitationEmail } from "../services/emailService";

const send: RequestHandler = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const userId = (req as AuthRequest).user?.id;
    const email = String(req.body.email ?? "")
      .trim()
      .toLowerCase();
    const role =
      req.body.role === "product_owner" ? "product_owner" : "collaborator";

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }
    if (Number.isNaN(projectId)) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ message: "Email invalide" });
      return;
    }

    const owner = await projectRepository.isOwner(projectId, userId);
    if (!owner) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }

    const project = await projectRepository.read(projectId);
    if (!project) {
      res.status(404).json({ message: "Projet introuvable" });
      return;
    }

    const collaborators = await projectRepository.getCollaborators(projectId);
    if (collaborators.some((c) => c.email.toLowerCase() === email)) {
      res
        .status(400)
        .json({ message: "Cette personne est déjà membre du projet" });
      return;
    }

    const existing = await invitationRepository.findPendingByProjectAndEmail(
      projectId,
      email,
    );
    if (existing) {
      res
        .status(400)
        .json({ message: "Une invitation est déjà en attente pour cet email" });
      return;
    }

    const [inviter] = await userRepository.getById(userId);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await invitationRepository.create({
      token,
      projectId,
      inviterId: userId,
      email,
      role,
      expiresAt,
    });

    await sendInvitationEmail({
      to: email,
      inviterName: inviter.name,
      projectTitle: project.title,
      token,
    });

    res.status(201).json({ message: "Invitation envoyée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'invitation" });
  }
};

const verify: RequestHandler<{ token: string }> = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await invitationRepository.findByToken(token);

    if (!invitation) {
      res.status(404).json({ message: "Invitation introuvable" });
      return;
    }
    if (invitation.status !== "pending") {
      res.status(400).json({ message: "Invitation déjà utilisée ou expirée" });
      return;
    }
    if (new Date(invitation.expires_at) < new Date()) {
      await invitationRepository.expire(token);
      res.status(400).json({ message: "Invitation expirée" });
      return;
    }

    res.json({
      email: invitation.email,
      role: invitation.role,
      projectId: invitation.project_id,
      projectTitle: invitation.project_title,
      inviterName: invitation.inviter_name,
    });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const accept: RequestHandler<{ token: string }> = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = (req as AuthRequest).user?.id;

    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) {
      res.status(404).json({ message: "Invitation introuvable" });
      return;
    }
    if (invitation.status !== "pending") {
      res.status(400).json({ message: "Invitation déjà utilisée ou expirée" });
      return;
    }
    if (new Date(invitation.expires_at) < new Date()) {
      await invitationRepository.expire(token);
      res.status(400).json({ message: "Invitation expirée" });
      return;
    }

    const [user] = await userRepository.getById(userId);
    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      res
        .status(403)
        .json({ message: "Cette invitation ne vous est pas destinée" });
      return;
    }

    await projectRepository.addCollaborator(
      invitation.project_id,
      userId,
      invitation.role,
    );
    await invitationRepository.accept(token);

    res.json({
      message: "Invitation acceptée",
      projectId: invitation.project_id,
    });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export default { send, verify, accept };
