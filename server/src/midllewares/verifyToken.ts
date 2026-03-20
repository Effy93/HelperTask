import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import userRepository from "../models/userRepository";
import type { IUser } from "../types/IUser";

dotenv.config();

export interface AuthRequest extends Request {
  user?: IUser;
}

const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies.access_token;

    console.log("COOKIES:", req.cookies);

    if (!token) {
      res.status(401).json({ message: "Pas de token" });
      return;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY || "key") as {
      user_id: number;
    };

    // 🔥 ON UTILISE L’ID, PAS L’EMAIL
    const users = await userRepository.getById(decoded.user_id);
    const user = users[0];
    // console.log("DECODED:", decoded);
    // console.log("USERS:", users);

    if (!user) {
      res.status(401).json({ message: "Utilisateur introuvable" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("JWT ERROR:", error);
    res.status(401).json({ message: "Token invalide" });
  }
};

export default verifyToken;
