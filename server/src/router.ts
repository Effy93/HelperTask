import express from "express";

const router = express.Router();

/* ************************************************************************* */
// IMPORTS
/* ************************************************************************* */

import authController from "./controllers/authController";
import invitationController from "./controllers/invitationController";
import projectController from "./controllers/projectController";
import taskController from "./controllers/taskController";
import userController from "./controllers/userController";
import verifyToken from "./midllewares/verifyToken";

/* ************************************************************************* */
// USER
/* ************************************************************************* */

router.post("/api/users", userController.add);
router.get("/api/users", userController.browse);
router.put("/api/users/me", verifyToken, userController.edit);

/* ************************************************************************* */
// AUTH
/* ************************************************************************* */

router.post("/api/login", authController.login);
router.post("/api/logout", authController.logout);
router.get("/api/me", verifyToken, authController.me);

/* ************************************************************************* */
// PROJECT ✅ PROTÉGÉ
/* ************************************************************************* */

router.post("/api/projects", verifyToken, projectController.add);
router.get("/api/projects", verifyToken, projectController.browse);
router.get("/api/projects/:id", verifyToken, projectController.read);
router.put("/api/projects/:id", verifyToken, projectController.edit);
router.delete("/api/projects/:id", verifyToken, projectController.destroy);
router.get(
  "/api/projects/:id/collaborators",
  verifyToken,
  projectController.getCollaborators,
);
router.post(
  "/api/projects/:id/collaborators",
  verifyToken,
  projectController.addCollaborator,
);
router.put(
  "/api/projects/:id/collaborators/:userId",
  verifyToken,
  projectController.updateCollaboratorRole,
);
router.delete(
  "/api/projects/:id/collaborators/:userId",
  verifyToken,
  projectController.removeCollaborator,
);

/* ************************************************************************* */
// TASK (déjà OK)
/* ************************************************************************* */

router.post("/api/tasks", verifyToken, taskController.add);
router.get("/api/tasks", verifyToken, taskController.browse);
router.put("/api/tasks/order", verifyToken, taskController.reorder);
router.get("/api/tasks/:id", verifyToken, taskController.read);
router.put("/api/tasks/:id", verifyToken, taskController.edit);
router.delete("/api/tasks/:id", verifyToken, taskController.destroy);
router.get(
  "/api/tasks/:id/assignees",
  verifyToken,
  taskController.getAssignees,
);
router.post("/api/tasks/:id/assignees", verifyToken, taskController.assignUser);
router.delete(
  "/api/tasks/:id/assignees/:userId",
  verifyToken,
  taskController.unassignUser,
);

/* ************************************************************************* */
// INVITATION
/* ************************************************************************* */

router.post(
  "/api/projects/:id/invitations",
  verifyToken,
  invitationController.send,
);
router.get("/api/invitations/:token", invitationController.verify);
router.post(
  "/api/invitations/:token/accept",
  verifyToken,
  invitationController.accept,
);

/* ************************************************************************* */

export default router;
