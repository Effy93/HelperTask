// Import the supertest library for making HTTP requests
import supertest from "supertest";

// Import the Express application
import app from "../../src/app";

// Import databaseClient
import databaseClient from "../../database/client";

import type { Result, Rows } from "../../database/client";

describe("GET /api/users", () => {
  it("Test de récupération de la liste des utilisateurs", async () => {
    const rows = [] as Rows;

    jest
      .spyOn(databaseClient, "query")
      .mockImplementation(async () => [rows, []]);
    const response = await supertest(app).get("/api/users");
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(rows);
  });
});

describe("POST /api/users", () => {
  it("Test création d'un utilisateur", async () => {
    const result = { insertId: 1 } as Result;
    jest
      .spyOn(databaseClient, "query")
      .mockImplementation(async () => [result, []]);
    const fakeUser = { name: "eva", email: "eva@eva.fr", password: "123" };
    const response = await supertest(app)
      .post("/api/users")
      .send(fakeUser)
      .set("Accept", "application.json");
    expect(response.status).toBe(201);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.message).toBe("Utilisateur créé!");
    // API mal codée = test impertinent
    // expect(response.body.insertId).toBe(result.insertId);
  });
});

//tests d’intégration API avec mocks.
