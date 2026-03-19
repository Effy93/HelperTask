import type { RequestHandler } from "express";
import projectRepository from "../models/projectRepository";
import type { IProject } from "../types/IProject";

const browse: RequestHandler = async (req, res) => {
  try {
    const projects = await projectRepository.readAll();
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
    if (!req.body) {
      res.status(400).json({ message: "Body manquant" });
      return;
    }

    const { title, description, status, position } = req.body;

    if (!title || !description || !status) {
      res.status(400).json({ message: "Champs requis" });
      return;
    }

    const newProject: Omit<IProject, "id"> = {
      title,
      description,
      status,
      position: position ?? 0,
    };

    const insertId = await projectRepository.create(newProject);

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
