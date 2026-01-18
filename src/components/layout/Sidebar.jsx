import "../../styles/sidebar.css";
import { Icon } from "../ui/Icon";
import { menuSidebardByRole } from "./menuconfig";
import { NavLink } from "react-router-dom";

export default function Sidebar({ role }) {
  const menu = menuSidebardByRole[role] || [];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">COFRES LUZ</div>

      <nav className="sidebar-menu">
        {menu.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "active" : ""}`
            }>
            <div className="sidebar-conjunto">

              <Icon name={item.icon} /> {item.label}
            </div>
          </NavLink>

        ))}

      </nav>
    </aside>
  );
}
