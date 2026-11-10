import { useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import "../../styles/sidebar.css";
import { Icon } from "../ui/Icon";
import { menuSidebardByRole } from "./menuconfig";
import { useAuthStore } from "../../stores/authStore.js";
import { useToast } from "../../hooks/useToast";
import { getAppErrorMessage } from "../../shared/errors/getAppErrorMessage";

export default function Sidebar() {
  const { role, logout } = useAuthStore();
  const { showError } = useToast();
  const navigate = useNavigate();

  const location = useLocation();
  const menu = menuSidebardByRole[role] || [];

  const grupoActivoInicial = menu.find((item) =>
    item.children?.some((child) => location.pathname.startsWith(child.path)),
  )?.label;

  const [openGroup, setOpenGroup] = useState(grupoActivoInicial || null);

  const toggleGroup = (label) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };
  const actions = {
    crear: () => navigate("/trabajador/inicio?crear=1"),
    logout: async () => {
      try {
        await logout();
      } catch (error) {
        showError("No se pudo cerrar la sesión", getAppErrorMessage(error));
      }
    },
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">SIGEC</div>

      <nav className="sidebar-menu">
        {menu.map((item) => {
          // Acción (Crear, Salir): botón, no ruta
          if (item.type === "action") {
            return (
              <button
                key={item.action}
                type="button"
                className={`sidebar-item sidebar-action ${
                  item.variant === "primary" ? "sidebar-action--primary" : ""
                } ${item.pushBottom ? "sidebar-action--end" : ""}`}
                onClick={actions[item.action]}
              >
                <div className="sidebar-conjunto">
                  <Icon name={item.icon} size={25} />
                  <div className="sidebar-item-label">{item.label}</div>
                </div>
              </button>
            );
          }

          // Item simple, sin hijos -> link directo
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
