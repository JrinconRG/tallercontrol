import "../../styles/sidebar.css";
import { Icon } from "../ui/Icon";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">COFRES LUZ</div>

      <nav className="sidebar-menu">
        <div className="sidebar-item active">
          <div className="sidebar-conjunto">
            <Icon name="Users" /> Empleados
          </div>
        </div>
        <div className="sidebar-item">
          <div className="sidebar-conjunto"><Icon name="Wallet" /> Nómina
          </div></div>
        <div className="sidebar-item">
          <div className="sidebar-conjunto"><Icon name="Layers" /> Procesos</div>
        </div>
        <div className="sidebar-item">
          <div className="sidebar-conjunto"><Icon name="History" /> Historial</div>
        </div>
      </nav>
    </aside>
  );
}
