import { useState } from "react";
import { Outlet } from "react-router-dom";
import type { IUser } from "../../server/src/types/IUser";
import Header from "./components/header/Header";

function App() {
  const [user, setUser] = useState<IUser | null>(null);

  return (
    <>
      <Header />

      <main className="main">
        <Outlet context={{ setUser, user }} />
      </main>
    </>
  );
}

export default App;
