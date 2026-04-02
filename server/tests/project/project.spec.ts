import type { NextFunction, Request, Response } from "express";
import supertest from "supertest";
import app from "../../src/app";
import type { AuthRequest } from "../../src/midllewares/verifyToken";
import projectRepository from "../../src/models/projectRepository";

//  mock du middleware verifyToken
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

// mock du repository
jest.mock("../../src/models/projectRepository");

describe("GET /api/projects", () => {
  it("doit retourner les projets de l'utilisateur", async () => {
    const fakeProjects = [{ id: 1, title: "Test" }];
    (projectRepository.readAllByUser as jest.Mock).mockResolvedValue(
      fakeProjects,
    );

    const res = await supertest(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeProjects);
  });

  it("doit gérer erreur serveur", async () => {
    (projectRepository.readAllByUser as jest.Mock).mockRejectedValue(
      new Error(),
    );

    const res = await supertest(app).get("/api/projects");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur serveur");
  });
});

describe("GET /api/projects/:id", () => {
  it("doit retourner un projet", async () => {
    const fakeProject = { id: 1, title: "Projet" };
    (projectRepository.read as jest.Mock).mockResolvedValue(fakeProject);

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
    (projectRepository.update as jest.Mock).mockResolvedValue(1);

    const res = await supertest(app)
      .put("/api/projects/1")
      .send({ title: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Projet mis à jour");
  });

  it("doit refuser si aucune donnée", async () => {
    const res = await supertest(app).put("/api/projects/1").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Aucune donnée à modifier");
  });

  it("doit retourner 404 si projet absent", async () => {
    (projectRepository.update as jest.Mock).mockResolvedValue(0);

    const res = await supertest(app)
      .put("/api/projects/1")
      .send({ title: "Updated" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/projects/:id", () => {
  it("doit supprimer un projet", async () => {
    (projectRepository.delete as jest.Mock).mockResolvedValue(1);

    const res = await supertest(app).delete("/api/projects/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Projet supprimé");
  });

  it("doit retourner 404 si projet absent", async () => {
    (projectRepository.delete as jest.Mock).mockResolvedValue(0);

    const res = await supertest(app).delete("/api/projects/1");

    expect(res.status).toBe(404);
  });
});

// tests d’intégration API avec mocks.
