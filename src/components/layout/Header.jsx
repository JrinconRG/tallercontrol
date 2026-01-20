import "../../styles/header.css";
import { useAuthStore } from "../../stores/authStore";
export default function Header() {
  const {role,user,logout} = useAuthStore();
  const titleByRole = {
    trabajador: "Bienvenidos",
    gerente: "Nómina",
  }

  const actionByRole = {
    gerente: (
      <div className="header-contenedor-boton">
      <button className="btn btn-header">
        Generar nómina
      </button>
      </div>
    ),
    trabajador: null
  };

  return (
    <header className="header">
      <div className="header-title">
      {titleByRole[role]}

      </div>

      <div className="header-actions">
      {actionByRole[role]}
      <button
          className="btn btn-primary"
          onClick={logout}
        >
        Cerrar sesión
      </button>
      </div>

    </header>
  );
}
