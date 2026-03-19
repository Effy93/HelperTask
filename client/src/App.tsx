import { Outlet } from "react-router-dom";
import Header from "./components/header/Header";

function App() {
  return (
    <>
      <Header />

      <main className="main">
        <Outlet />
      </main>
    </>
  );
}

export default App;
