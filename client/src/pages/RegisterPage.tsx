import RegisterForm from "../components/forms/RegisterForm";
import "../components/forms/form.css";

export default function RegisterPage() {
  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Inscription</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
