# Routes API — Task Helper

## Utilisateurs

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/users` | Non | Créer un compte |
| GET | `/api/users` | Non | Lister tous les utilisateurs |
| PUT | `/api/users/me` | Oui | Modifier son propre profil (nom, email, mot de passe) |

---

## Authentification

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/login` | Non | Se connecter (retourne un cookie JWT) |
| POST | `/api/logout` | Non | Se déconnecter (supprime le cookie) |
| GET | `/api/me` | Oui | Récupérer les infos de l'utilisateur connecté |

---

## Projets

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/projects` | Oui | Créer un projet |
| GET | `/api/projects` | Oui | Lister ses projets (owner + collab) |
| GET | `/api/projects/:id` | Oui | Voir un projet |
| PUT | `/api/projects/:id` | Oui | Modifier un projet |
| DELETE | `/api/projects/:id` | Oui | Supprimer un projet |
| GET | `/api/projects/:id/collaborators` | Oui | Lister les collaborateurs d'un projet |
| POST | `/api/projects/:id/collaborators` | Oui | Ajouter un collaborateur |
| PUT | `/api/projects/:id/collaborators/:userId` | Oui | Modifier le rôle d'un collaborateur |
| DELETE | `/api/projects/:id/collaborators/:userId` | Oui | Retirer un collaborateur |

---

## Tâches

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/tasks` | Oui | Créer une tâche |
| GET | `/api/tasks` | Oui | Lister les tâches (filtrable par projet) |
| PUT | `/api/tasks/order` | Oui | Réordonner les tâches |
| GET | `/api/tasks/:id` | Oui | Voir une tâche |
| PUT | `/api/tasks/:id` | Oui | Modifier une tâche |
| DELETE | `/api/tasks/:id` | Oui | Supprimer une tâche |
| GET | `/api/tasks/:id/assignees` | Oui | Lister les assignés d'une tâche |
| POST | `/api/tasks/:id/assignees` | Oui | Assigner un utilisateur à une tâche |
| DELETE | `/api/tasks/:id/assignees/:userId` | Oui | Retirer un assigné d'une tâche |

---

## Invitations

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/projects/:id/invitations` | Oui | Envoyer une invitation par email |
| GET | `/api/invitations/:token` | Non | Vérifier un token d'invitation |
| POST | `/api/invitations/:token/accept` | Oui | Accepter une invitation |

---

> **Auth** = route protégée par `verifyToken` (cookie JWT requis)
