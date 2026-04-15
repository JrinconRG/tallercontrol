import "../../styles/header.css";
import { useAuthStore } from "../../stores/authStore";
export default function Header() {
  const { role, logout } = useAuthStore();
  const titleByRole = {
    trabajador: "Bienvenidos",
    gerente: "Bienvenidos",
  };

  const actionByRole = {
    gerente: (
      <div className="header-contenedor-boton">
        <button className="btn btn-header">Generar nómina</button>
      </div>
    ),
    trabajador: null,
  };

  return (
    <header className="header">
      <div className="header-title">{titleByRole[role]}</div>

      <div className="header-actions">
        <button className="btn btn-primary" onClick={logout}>
          Cerrar sesión
        </button>
        {actionByRole[role]}
      </div>
    </header>
  );
}
