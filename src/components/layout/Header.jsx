import { useNavigate } from "react-router-dom";
import "../../styles/header.css";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../../hooks/useToast";
import { getAppErrorMessage } from "../../shared/errors/getAppErrorMessage";

export default function Header() {
  const { role, logout } = useAuthStore();
  const { showError } = useToast();
  const navigate = useNavigate();

  const titleByRole = {
    trabajador: "Bienvenidos",
    gerente: "Bienvenidos",
  };

  const actionByRole = {
    gerente: (
      <div className="header-contenedor-boton">
        <button
          className="btn btn-header"
          onClick={() => navigate("/gerente/nomina/fecha")}
        >
          Generar nómina
        </button>
      </div>
    ),
    trabajador: null,
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showError("No se pudo cerrar la sesión", getAppErrorMessage(error));
    }
  };

  return (
    <header className="header">
      <div className="header-title">{titleByRole[role]}</div>

      <div className="header-actions">
        <button className="btn btn-primary" onClick={handleLogout}>
          Cerrar sesión
        </button>

        {actionByRole[role]}
      </div>
    </header>
  );
}
