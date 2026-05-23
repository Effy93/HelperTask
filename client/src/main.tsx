import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import "./App.css";
import "./styles/palette.css";
import "./styles/buttons.css";
import "./styles/invite.css";
import "./styles/toast.css";

import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import Board from "./pages/Board";
import Home from "./pages/Home";
import InvitePage from "./pages/InvitePage";
import Profile from "./pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "invite/:token", element: <InvitePage /> },

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
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
