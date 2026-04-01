import userRepository from "../../src/models/userRepository";
import databaseClient from "../../database/client";
import type { Rows } from "../../database/client";

// test unitaire du model user avec "mock" = simulation, de la base de données
// vérifie que la fonction readAll appel la méthode databaseClient.query et renvoie des rows
describe("UserRepository.readAll", () => {
  it("doit appeler readAll et renvoyer le resultat de la requête", async () => {
    // Crée un faux utilisateur
    const fakeRows = [
      { id: 1, name: "Eva", email: "eva@mail.com", password: "123" }
    ] as Rows;

    // Méthode spyOn du framework jest, permet d'espionner 
    // si le code tester appel bien une une fonction, ici databaseClient (donc la requête)
    // mockResolvedValue, simule la reponse de la requête asynchrone
    jest.spyOn(databaseClient, "query").mockResolvedValue([fakeRows, []]);

    // pas de vrai requête grâce a spyOn, le resultat de la requête simulée
    // sera les argument de mockedResolvedValue= fakeRows
    const result = await userRepository.readAll();

    // Le resultat doit retourné les même données que la BDD simulée = fakeRows
    expect(result).toEqual(fakeRows);
    // expect(name).toBeDefined()
    console.log(result)
  });
});