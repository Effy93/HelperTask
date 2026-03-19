import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

import authController from "./controllers/authController";
import projectController from "./controllers/projectController";
import taskController from "./controllers/taskController";
// Define item-related routes
// import itemActions from "./modules/item/itemActions";
import userController from "./controllers/userController";
import verifyToken from "./midllewares/verifyToken";

// router.get("/api/items", itemActions.browse);
// router.get("/api/items/:id", itemActions.read);

// USER
router.post("/api/users", userController.add);
router.get("/api/users", userController.browse);

// AUTH
router.post("/api/login", authController.login);
router.get("/api/me", verifyToken, authController.me);

// PROJECT
router.post("/api/projects", projectController.add);
router.get("/api/projects", projectController.browse);
router.get("/api/projects/:id", projectController.read);
router.put("/api/projects/:id", projectController.edit);
router.delete("/api/projects/:id", projectController.destroy);

// Protected project
// router.post("/api/projects", verifyToken, projectController.add);
// router.get("/api/projects", verifyToken, projectController.browse);
// router.get("/api/projects/:id", verifyToken, projectController.read);
// router.put("/api/projects/:id", verifyToken, projectController.edit);
// router.delete("/api/projects/:id", verifyToken, projectController.destroy);

// TASK
router.post("/api/tasks", verifyToken, taskController.add);
router.get("/api/tasks", verifyToken, taskController.browse);
router.get("/api/tasks/:id", verifyToken, taskController.read);
router.put("/api/tasks/:id", verifyToken, taskController.edit);
router.delete("/api/tasks/:id", verifyToken, taskController.destroy);

// drag and drop
// router.patch("/api/tasks/reorder", taskController.reorder);

export default router;
