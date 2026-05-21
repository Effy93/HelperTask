import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import userRepository from "../models/userRepository";
import type { IUser } from "../types/IUser";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const users = await userRepository.readAll();
    res.json(users);
    return;
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    return;
  }
};

const read: RequestHandler = async (req, res) => {
  try {
    const users = await userRepository.readAll();
    res.json(users);
    return;
  } catch (error) {}
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const add: RequestHandler = async (req, res) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    if (!name || !email || !password) {
      res.status(400).json({ message: "Tous les champs sont requis" });
      return;
    }
    if (name.length > 100) {
      res.status(400).json({ message: "Nom trop long (100 caractères max)" });
      return;
    }
    if (!EMAIL_REGEX.test(email) || email.length > 255) {
      res.status(400).json({ message: "Email invalide" });
      return;
    }
    if (password.length < 8 || password.length > 100) {
      res.status(400).json({ message: "Mot de passe : 8 à 100 caractères" });
      return;
    }

    const existing = await userRepository.getByEmail(email);
    if (existing.length > 0) {
      res.status(409).json({ message: "Compte déjà existant" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: Omit<IUser, "id"> = { name, email, password: hashedPassword };
    await userRepository.create(newUser);
    res.status(201).json({ message: "Utilisateur créé" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
  } catch (error) {}
};

const destroy: RequestHandler = async (req, res, next) => {
  try {
  } catch (error) {}
};

export default { browse, add, read, edit, destroy };
