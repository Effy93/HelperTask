import { useState } from "react";
import type { IUser } from "../../server/src/types/IUser";
import LoginForm from "../src/components/forms/LoginForm";
import RegisterForm from "../src/components/forms/RegisterForm";

export default function App() {
  const [user, setUser] = useState<IUser | null>(null);

  return (
    <div>
      {!user ? (
        <>
          <h1>Se connecter</h1>
          <LoginForm setUser={setUser} />

          <h1>S'inscrire</h1>
          <RegisterForm setUser={setUser} />
        </>
      ) : (
        <div>
          <h2>Bienvenue {user.name} !</h2>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  );
}
