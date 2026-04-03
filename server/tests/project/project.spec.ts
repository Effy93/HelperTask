import type { NextFunction, Request, Response } from "express";
import supertest from "supertest";
import app from "../../src/app";
import type { AuthRequest } from "../../src/midllewares/verifyToken";
import projectRepository from "../../src/models/projectRepository";

// Tests d’intégration des routes Projects (couche controller -> router.ts)
// Couche testée : Route → Middleware → Controller → Repository (mocké) → Response HTTP
// Vérifie :
//   - authentification (bypassée pour tests)
//   - validation des inputs
//   - gestion des erreurs
//   - logique métier (ex: create -> position 0 todo, update -> pas de champs vides)
//   - réponse HTTP correcte

// Préparation globale : simulation des modules nécessaires
// mock du middleware verifyToken = remplace le fichier , bypasser (contourner) l’auth pour pouvoir tester les routes.
jest.mock("../../src/midllewares/verifyToken", () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    (req as AuthRequest).user = {
      id: 1,
      name: "Test",
      email: "test@test.com",
      password: "hashed",
    };
    next();
  };
});
// mock du repository = remplace un module
jest.mock("../../src/models/projectRepository");

// 4 - Nettoyage des mocks (mockResolvedValue)
afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/projects", () => {
  it("doit retourner les projets de l'utilisateur", async () => {
    // 1 - Préparation spécifique par test
    // fausse données
    const fakeProjects = [{ id: 1, title: "Test" }];

    // Simuler la réponse du repository
    (projectRepository.readAllByUser as jest.Mock).mockResolvedValue(
      fakeProjects,
    );

    // 2 - Execute (requete http)
    const res = await supertest(app).get("/api/projects");

    // 3 - Vérifie status et contenu du body
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeProjects);
  });

  it("doit gérer erreur serveur", async () => {
    // 1 - Prépare
    (projectRepository.readAllByUser as jest.Mock).mockRejectedValue(
      new Error(),
    );

    // 2 - Exécute
    const res = await supertest(app).get("/api/projects");

    // 3 - Vérifie
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur serveur");
  });
});

describe("GET /api/projects/:id", () => {
  it("doit retourner un projet", async () => {
    const fakeProject = { id: 1, title: "Projet" };
    (projectRepository.read as jest.Mock).mockResolvedValue(fakeProject);

    // 2 - Exécute (requete http)
    const res = await supertest(app).get("/api/projects/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeProject);
  });

  it("doit retourner 400 si id invalide", async () => {
    const res = await supertest(app).get("/api/projects/abc");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("ID invalide");
  });

  it("doit retourner 404 si projet absent", async () => {
    (projectRepository.read as jest.Mock).mockResolvedValue(null);

    const res = await supertest(app).get("/api/projects/1");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/projects", () => {
  it("doit créer un projet", async () => {
    (projectRepository.create as jest.Mock).mockResolvedValue(1);

    const newProject = { title: "Mon projet" };

    const res = await supertest(app).post("/api/projects").send(newProject);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Mon projet");
    expect(res.body.status).toBe("todo");
    expect(res.body.position).toBe(0);
  });

  it("doit refuser sans titre", async () => {
    const res = await supertest(app).post("/api/projects").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Titre requis");
  });
});

describe("PUT /api/projects/:id", () => {
  it("doit modifier un projet", async () => {
    // 1 - Prépare
    // remplace un module entier
    (projectRepository.update as jest.Mock).mockResolvedValue(1);

    // 2 - Exécute
    const res = await supertest(app)
      .put("/api/projects/1")
      .send({ title: "Updated" });

    // 3 - Vérifie
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Projet mis à jour");
  });

  it("doit refuser si aucune donnée", async () => {
    // 2 - Exécute
    const res = await supertest(app).put("/api/projects/1").send({});

    // 3 - Vérifie
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Aucune donnée à modifier");
  });

  // Test de vrai règle logique métier = refus la modif si pas de titre
  it("refuse un titre vide", async () => {
    // 2 - Exécute (requete http)
    const res = await supertest(app).put("/api/projects/1").send({ title: "" });

    // 3 - Vérife
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Titre requis");
  });

  it("doit retourner 404 si projet absent", async () => {
    // 1 - Prépare
    (projectRepository.update as jest.Mock).mockResolvedValue(0);

    // 2 - Exécute
    const res = await supertest(app)
      .put("/api/projects/1")
      .send({ title: "Updated" });

    // 3 - Vérifie
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/projects/:id", () => {
  it("doit supprimer un projet", async () => {
    // 1 - Prépare
    (projectRepository.delete as jest.Mock).mockResolvedValue(1);

    // 2 - Exécute
    const res = await supertest(app).delete("/api/projects/1");

    // 3 - Vérifie
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Projet supprimé");
  });

  it("doit retourner 404 si projet absent", async () => {
    // 1 - Prépare
    (projectRepository.delete as jest.Mock).mockResolvedValue(0);

    // 2 - Exécute
    const res = await supertest(app).delete("/api/projects/1");

    // 3 - Vérifie
    expect(res.status).toBe(404);
  });
});
