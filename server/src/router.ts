import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

import authController from "./controllers/authController";
// Define item-related routes
// import itemActions from "./modules/item/itemActions";
import userController from "./controllers/userController";
import verifyToken from "./midllewares/verifyToken";

// router.get("/api/items", itemActions.browse);
// router.get("/api/items/:id", itemActions.read);

router.post("/api/users", userController.add);
router.get("/api/users", userController.browse);

router.post("/api/login", authController.login);
router.get("/api/me", verifyToken, authController.me);

export default router;
