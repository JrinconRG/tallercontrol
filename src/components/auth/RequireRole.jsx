import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
export default function RequireRole({ allowedRoles, children }) {
  const { isAuthenticated, role, isSessionExpired, logout } = useAuthStore();
  const location = useLocation();

  const expired =
    typeof isSessionExpired === "function" ? isSessionExpired() : false;

  useEffect(() => {
    if (isAuthenticated && expired) {
      toast.error("Su sesión ha expirado. Ingrese nuevamente.");
      logout();
    }
  }, [isAuthenticated, expired, logout]);

  // 1. Redirigir al login si no está autenticado o expiro la sesión
  if (!isAuthenticated || expired) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Redirigir si el rol actual no está dentro de los autorizados
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // 3. Renderizar vista permitida
  return children;
}

RequireRole.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};
