import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import "../../styles/sidebar.css";
import { Icon } from "../ui/Icon";
import { menuSidebardByRole } from "./menuconfig";
import { useAuthStore } from "../../stores/authStore.js";

export default function Sidebar() {
  const { role } = useAuthStore();
  const location = useLocation();
  const menu = menuSidebardByRole[role] || [];

  const grupoActivoInicial = menu.find(
    (item) =>
      item.children &&
      item.children.some((child) => location.pathname.startsWith(child.path)),
  )?.label;

  const [openGroup, setOpenGroup] = useState(grupoActivoInicial || null);

  const toggleGroup = (label) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">SIGEC</div>

      <nav className="sidebar-menu">
        {menu.map((item) => {
          // Item simple, sin hijos -> link directo (tu comportamiento actual)
          if (!item.children) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end ?? true}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""}`
                }
              >
                <div className="sidebar-conjunto">
                  <Icon name={item.icon} size={25} />
                  <div className="sidebar-item-label">{item.label}</div>
                </div>
              </NavLink>
            );
          }

          const isOpen = openGroup === item.label;
          return (
            <div key={item.label} className="sidebar-group">
              <button
                type="button"
                className="sidebar-item sidebar-group-btn"
                onClick={() => toggleGroup(item.label)}
              >
                <div className="sidebar-conjunto">
                  <Icon name={item.icon} size={25} />
                  <div className="sidebar-item-label">{item.label}</div>
                </div>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`sidebar-chevron ${isOpen ? "open" : ""}`}
                />
              </button>

              <div className={`sidebar-group-body ${isOpen ? "open" : ""}`}>
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    end={child.end ?? true}
                    className={({ isActive }) =>
                      `sidebar-subitem ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon name={child.icon} size={24} />
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
