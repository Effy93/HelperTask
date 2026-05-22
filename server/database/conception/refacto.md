# Refactorisation — Application des principes SOLID

## Contexte

Score Lighthouse avant refacto : **Performance 68** (FCP 1,7s · LCP 4,7s · Speed Index 2,1s)  
Objectif : améliorer les performances et structurer le code selon les principes SOLID.

---

## Ancienne architecture

```
client/src/
├── pages/
│   ├── Board.tsx          ← 849 lignes : fetch projet + fetch tâches + fetch collabs
│   │                         + drag & drop + panneau create/edit + assignees + réordonnancement
│   └── Profile.tsx        ← 470 lignes : édition user + CRUD projets + listing collabs + modal
├── components/
│   ├── profile/
│   │   ├── Column.tsx
│   │   └── TaskCard.tsx   ← AVATAR_COLORS / getInitials dupliqués localement
│   └── ...
├── assets/images/
│   ├── profile.png        ← 3,1 Mo  (affiché à 80px)
│   ├── logout.png         ← 3,1 Mo  (affiché à 80px)
│   ├── btn-addCollab.png  ← 2,1 Mo
│   ├── bg.png             ← 2,2 Mo
│   ├── invit-collab.png   ← 1,2 Mo
│   ├── maquette-task.png  ← 1,4 Mo
│   └── icon-sb.png        ← 1,3 Mo
│                             Total : ~14 Mo de PNG
├── services/              ← dossier vide (jamais utilisé)
└── hooks/                 ← inexistant

server/src/
├── controllers/
│   └── projectController.ts  ← gère projets ET collaborateurs (2 responsabilités)
├── midllewares/              ← faute de frappe dans le nom du dossier
│   └── verifyToken.ts
└── ...
```

### Violations SOLID identifiées

| Principe | Violation |
|----------|-----------|
| **S** — Single Responsibility | `Board.tsx` cumule 6 responsabilités. `Profile.tsx` en cumule 4. `projectController` gère projets + collabs. |
| **O** — Open/Closed | Labels de statut (`"À faire"`, `"En cours"`, `"Terminé"`) et couleurs d'avatar hardcodés dans 3+ fichiers. Ajouter un statut = modifier N endroits. |
| **I** — Interface Segregation | `Column.tsx` reçoit trop de props non liées à sa responsabilité. |
| **D** — Dependency Inversion | Tous les `fetch()` directement dans les composants. Zéro couche d'abstraction. |

---

## Nouvelle architecture

```
client/src/
├── pages/
│   ├── Board.tsx          ← ~200 lignes : orchestrateur uniquement
│   └── Profile.tsx        ← ~55 lignes  : orchestrateur uniquement
│
├── components/
│   ├── board/             ← nouveau
│   │   ├── BoardHeader.tsx    (hero + meta projet + bouton nouvelle tâche)
│   │   ├── BoardColumns.tsx   (DnD context + colonnes)
│   │   ├── TaskDrawer.tsx     (panneau create / edit tâche)
│   │   └── BoardSidebar.tsx   (légende + liste collaborateurs)
│   ├── profile-page/      ← nouveau
│   │   ├── ProfileHero.tsx    (bienvenue + formulaire édition user)
│   │   ├── ProjectCreator.tsx (formulaire création projet)
│   │   └── ProjectCard.tsx    (carte projet avec collabs)
│   └── profile/
│       ├── Column.tsx
│       └── TaskCard.tsx   ← utilise désormais les utils partagés
│
├── hooks/                 ← nouveau
│   ├── useProjects.ts         (state + CRUD projets + collabs associés)
│   ├── useTasks.ts            (state + CRUD tâches + assignees)
│   ├── useCollaborators.ts    (state + fetch collaborateurs)
│   └── useDragAndDrop.ts      (toute la logique @dnd-kit isolée)
│
├── services/              ← nouveau (dossier existait mais était vide)
│   ├── api.ts                 (apiFetch : wrapper fetch centralisé)
│   ├── projectService.ts      (fetchProjects, createProject, updateProject, deleteProject)
│   ├── taskService.ts         (fetchTasks, createTask, updateTask, deleteTask, reorderTasks, assignees)
│   ├── userService.ts         (updateMe)
│   └── collaboratorService.ts (fetchCollaborators, addCollaborator, sendInvitation, …)
│
├── utils/                 ← nouveau
│   ├── avatar.ts              (AVATAR_COLORS, getAvatarColor, getInitials — source unique)
│   └── taskStatus.ts          (TASK_STATUSES, TASK_STATUS_LABELS — source unique)
│
└── assets/images/
    ├── profile.webp       ← 200 Ko  (−94%)
    ├── logout.webp        ← 172 Ko  (−94%)
    ├── btn-addCollab.webp ← 140 Ko  (−93%)
    ├── bg.webp            ← 148 Ko  (−93%)
    ├── invit-collab.webp  ←  60 Ko  (−95%)
    ├── maquette-task.webp ←  88 Ko  (−94%)
    └── icon-sb.webp       ←  72 Ko  (−94%)
                              Total : ~880 Ko (−94%)

server/src/
├── controllers/
│   ├── projectController.ts      ← projets uniquement (browse, read, add, edit, destroy)
│   └── collaboratorController.ts ← nouveau : collaborateurs uniquement
├── middlewares/                  ← faute de frappe corrigée (midllewares → middlewares)
│   └── verifyToken.ts
└── ...
```

---

## Plan exécuté (7 étapes)

### Étape 1 — Performance : conversion PNG → WebP
- Outil : `cwebp -q 85`
- Toutes les images converties, toutes les références mises à jour dans `.tsx` et `.css`
- Gain : **14 Mo → 880 Ko** (−94%)

### Étape 2 — Utilitaires partagés
- `utils/avatar.ts` : `AVATAR_COLORS`, `getAvatarColor`, `getInitials`
- `utils/taskStatus.ts` : `TASK_STATUSES`, `TASK_STATUS_LABELS`
- Suppression des duplications dans `Board.tsx`, `Profile.tsx`, `TaskCard.tsx`

### Étape 3 — Couche service (Dependency Inversion)
- `services/api.ts` : `apiFetch<T>()` — un seul endroit pour `credentials`, headers, gestion d'erreur
- `services/projectService.ts`, `taskService.ts`, `userService.ts`, `collaboratorService.ts`
- Plus aucun `fetch()` brut dans les composants

### Étape 4 — Custom hooks (Single Responsibility)
- `useProjects` : state + CRUD projets
- `useTasks` : state + CRUD tâches + assignees
- `useCollaborators` : state + fetch
- `useDragAndDrop` : toute la logique @dnd-kit (sensors, groupedTasks, handlers)

### Étape 5 — Découpage Board.tsx (Single Responsibility)
- 849 lignes → ~200 lignes
- 4 composants extraits : `BoardHeader`, `BoardColumns`, `TaskDrawer`, `BoardSidebar`

### Étape 6 — Découpage Profile.tsx (Single Responsibility)
- 470 lignes → ~55 lignes
- 3 composants extraits : `ProfileHero`, `ProjectCreator`, `ProjectCard`

### Étape 7 — Serveur
- `collaboratorController.ts` extrait de `projectController.ts`
- `router.ts` mis à jour pour pointer vers `collaboratorController`
- Dossier `midllewares` renommé en `middlewares` — tous les imports corrigés (controllers, router, tests)

---

## Résultat

| Métrique | Avant | Après |
|----------|-------|-------|
| Poids images | ~14 Mo | ~880 Ko |
| `Board.tsx` | 849 lignes | ~200 lignes |
| `Profile.tsx` | 470 lignes | ~55 lignes |
| Couche service | aucune | 4 services + `apiFetch` |
| Custom hooks | aucun | 4 hooks |
| Utilitaires partagés | 0 (dupliqués 3×) | 2 fichiers sources uniques |
| Fautes dans le code | `midllewares` × 6 | corrigé partout |
| TypeScript | 0 erreur | 0 erreur |
