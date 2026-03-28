import "../../styles/sidebar.css";
import { Icon } from "../ui/Icon";
import { menuSidebardByRole } from "./menuconfig";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore.js";

export default function Sidebar() {
  const { role } = useAuthStore();
  const menu = menuSidebardByRole[role] || [];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">SIGEC</div>

      <nav className="sidebar-menu">
        {menu.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-conjunto">
              <Icon name={item.icon} size={25} />
              <div className="sidebar-item-label">{item.label}</div>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
