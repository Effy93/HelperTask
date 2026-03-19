import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;

  if (!user) return <Navigate to="/login" />; // 🔥 protection

  return (
    <div>
      <h1>Bienvenue {user.name} </h1>
      <p>Email : {user.email}</p>
    </div>
  );
}
