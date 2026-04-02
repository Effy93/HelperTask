import databaseClient from "../../database/client";
import type { Result, Rows } from "../../database/client";
import userRepository from "../../src/models/userRepository";

// tests unitaires du model (repository) user avec "mock" = simulation, de la base de données
describe("UserRepository", () => {
  // 4 - Nettoie le spy après chaque query
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("doit tester la fonction create et retourner l'id de l'utilisateur créer", async () => {
      // 1 - Prépare les données à tester.
      // mock du resultat attendu par la query
      const fakeResult = { insertId: 12 } as Result;
      // initialisation du spy sur l'object databaseClient, methode : query
      const querySpy = jest
        .spyOn(databaseClient, "query")
        .mockResolvedValue([fakeResult, []]);
      // mock d'un utilisateur
      const newUser = {
        name: "Eva",
        email: "eva@mail.com",
        password: "123",
      };

      // 2 - Exécute
      // test de l'appel de la requete (existe t'elle bien dans le fichier userRepository)
      // l'espion remplace cette fonction, elle sera donc appeler mais le sql ne sera pas lancé. On verifie juste qu'elle existe bien
      const result = await userRepository.create(newUser);

      // 3 - Verifie
      // A t'elle le comportement attendue ? elle contient la requête SQL : insert into ... .
      expect(querySpy).toHaveBeenCalledWith(
        "INSERT INTO user (name, email, password) VALUES (?,?,?)",
        [newUser.name, newUser.email, newUser.password],
      );
      // elle renvoi => l'id 12
      expect(result).toBe(12);
    });
  });

  // vérifie que la fonction readAll appel la méthode databaseClient.query et renvoie des rows
  describe("UserRepository.readAll", () => {
    it("doit appeler readAll et renvoyer le resultat de la requête", async () => {
      // 1- Prépare
      // Crée un faux utilisateur
      const fakeRows = [
        { id: 1, name: "Eva", email: "eva@mail.com", password: "123" },
      ] as Rows;

      // Méthode spyOn du framework jest, permet d'espionner
      // si le code tester appel bien une une fonction, ici databaseClient (donc la requête)
      // mockResolvedValue, simule la reponse de la requête asynchrone
      const querySpy = jest
        .spyOn(databaseClient, "query")
        .mockResolvedValue([fakeRows, []]);

      // 2 - Exécute
      // pas de vrai requête grâce a spyOn, le resultat de la requête simulée
      // sera les arguments de mockedResolvedValue= fakeRows
      const result = await userRepository.readAll();

      // 3 - Vérifie
      // Le resultat doit retourné les mêmes données que la BDD simulée = fakeRows
      expect(result).toEqual(fakeRows);
      // verifie que la DB (mocké) est bien appelée
      expect(querySpy).toHaveBeenCalled();
      // verifier que la DB est appeléé une seule fois (cas fréquent de copier coller oubliée lors de debug)
      expect(querySpy).toHaveBeenCalledTimes(1);
      // verifie que la bonne requete SQL est envoyée
      expect(querySpy).toHaveBeenCalledWith("SELECT * FROM user");

      // console.log(result);
      // console.log(querySpy);
    });
  });

  describe("update", () => {
    it("doit mettre à jour un utilisateur", async () => {
      // 1 - prépare
      // resultat
      const fakeResult = { affectedRows: 1 } as Result;

      // spy sur query
      const querySpy = jest
        .spyOn(databaseClient, "query")
        .mockResolvedValue([fakeResult, []]);

      // mock BDD
      const userUpdate = {
        name: "NewName",
        email: "new@mail.com",
        password: "456",
      };

      // 2 - Execute
      const result = await userRepository.update(1, userUpdate);

      // 3 - Verifie
      expect(querySpy).toHaveBeenCalledWith(
        "UPDATE user SET name =?, email =?, password =? WHERE id =? ",
        [userUpdate.name, userUpdate.email, userUpdate.password, 1],
      );
      expect(result).toEqual([fakeResult, []]);
    });
  });

  describe("delete", () => {
    it("doit supprimer un utilisateur", async () => {
      // 1 - Prépare
      const fakeResult = { affectedRows: 1 } as Result;
      const querySpy = jest
        .spyOn(databaseClient, "query")
        .mockResolvedValue([fakeResult, []]);

      // 2 - Exécute
      const result = await userRepository.delete(1);

      // 3 - Vérifie
      expect(querySpy).toHaveBeenCalledWith(
        "DELETE from user WHERE id = ?",
        [1],
      );

      expect(result).toEqual([fakeResult, []]);
    });
  });

  describe("getByEmail", () => {
    it("doit retourner un utilisateur via email", async () => {
      // 1 - Prépare
      const fakeRows = [
        { id: 1, name: "Eva", email: "eva@mail.com", password: "123" },
      ] as Rows;

      const querySpy = jest
        .spyOn(databaseClient, "query")
        .mockResolvedValue([fakeRows, []]);

      // 2 - Exécute
      const result = await userRepository.getByEmail("eva@mail.com");

      // 3 - Vérifie
      expect(querySpy).toHaveBeenCalledWith(
        "SELECT * FROM user WHERE email = ?",
        ["eva@mail.com"],
      );
      expect(result).toEqual(fakeRows);
    });
  });

  describe("getById", () => {
    it("doit retourner un utilisateur via id", async () => {
      // 1 - Prépare
      const fakeRows = [
        { id: 1, name: "Eva", email: "eva@mail.com", password: "123" },
      ] as Rows;

      const querySpy = jest
        .spyOn(databaseClient, "query")
        .mockResolvedValue([fakeRows, []]);

      // 2 - Exécute
      const result = await userRepository.getById(1);

      // 3 - Vérifie
      expect(querySpy).toHaveBeenCalledWith(
        "SELECT * FROM user WHERE id = ?",
        [1],
      );
      expect(result).toEqual(fakeRows);
    });
  });
});
