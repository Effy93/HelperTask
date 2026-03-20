import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import "./App.css";

import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginForm from "./components/forms/LoginForm";
import RegisterForm from "./components/forms/RegisterForm";

import Board from "./pages/Board";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile", element: <Profile /> },
          { path: "project/:id", element: <Board /> }, // seule page projet
        ],
      },
    ],
  },
]);

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
