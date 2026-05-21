import LoginForm from "../components/forms/LoginForm";
import "../components/forms/form.css";

export default function LoginPage() {
  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Connexion</h1>
        <LoginForm />
      </div>
    </div>
  );
}
