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

const add: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  // Est ce que les champs sont bien remplies ?
  // Est ce que l'utilisateur existe déjà (via email, utiliser la requete du repo)
  // Si oui, hasher le mdp et insertion des input + id dans la BDD
  try {
    if (!req.body) {
      res
        .status(404)
        .json({ message: "Tous les champs doivent être renseignés" });
      return;
    }
    const user = await userRepository.getByEmail(email);

    if (user.length > 0) {
      res.status(401).json({ message: "Compte existant" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: Omit<IUser, "id"> = {
      name,
      email,
      password: hashedPassword,
    };
    const insertId = await userRepository.create(newUser);
    res.status(201).json({ message: "Utilisateur créé!" });
  } catch (error) {
    res.status(500).json({ message: "erreur serveur" });
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
