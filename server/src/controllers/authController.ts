import bcrypt from "bcrypt";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../midllewares/verifyToken";
import userRepository from "../models/userRepository";

dotenv.config();

// Login
const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Identifiants requis" });
      return;
    }

    const users = await userRepository.getByEmail(email);
    const user = users[0];

    if (!user) {
      res.status(401).json({ message: "Identifiants non valides" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ message: "Identifiants non valides" });
      return;
    }

    // Génération du token
    const token = jwt.sign(
      { user_id: user.id, user_email: user.email, role: "user" },
      process.env.SECRET_KEY || "defaultsecret123!",
      { expiresIn: "8h" },
    );

    // Stockage dans le cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000), // 8h
    });

    res.status(200).json({ message: "Connexion réussie" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Route protégée /me
const me = (req: AuthRequest, res: Response): void => {
  // verification supplémentaire si moodification du verifyToken
  if (!req.user) {
    res.status(401).json({ message: "Utilisateur non trouvé" });
    return;
  }

  const { id, name, email } = req.user;
  res.status(200).json({
    message: "Accès au profil autorisé",
    user: { id, name, email },
  });
};

const logout = (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true en production HTTPS
    });

    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const authController = { login, me, logout };

export default authController;
