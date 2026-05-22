import { Link } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label?: string;
}

export default function BackButton({
  to,
  label = "Retour projets",
}: BackButtonProps) {
  return (
    <Link to={to} className="back-link">
      <button type="button" className="back-btn">
        ← {label}
        <span />
      </button>
    </Link>
  );
}
