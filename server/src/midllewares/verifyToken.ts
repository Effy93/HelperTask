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

    if (!token) {
      res
        .status(401)
        .json({ message: "Action non autorisée, veuillez vous connectez" });
      return;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY || "key") as {
      user_id: string;
      user_email: string;
      role: string;
    };

    const users = await userRepository.getByEmail(decoded.user_email);
    const user = users[0];

    if (!user) {
      res
        .status(401)
        .json({ message: "Action non autorisée, veuillez vous inscrire" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Accès interdit" });
  }
};

export default verifyToken;
