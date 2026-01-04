import "../../styles/sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">COFRES LUZ</div>

      <nav className="sidebar-menu">
        <div className="sidebar-item active">Empleados</div>
        <div className="sidebar-item">Nómina</div>
        <div className="sidebar-item">Procesos</div>
        <div className="sidebar-item">Historial</div>
      </nav>
    </aside>
  );
}
