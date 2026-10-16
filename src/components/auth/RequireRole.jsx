import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../../hooks/useToast";

export default function RequireRole({ allowedRoles, children }) {
  const { isAuthenticated, role, isSessionExpired, logout } = useAuthStore();
  const { showError } = useToast();
  const location = useLocation();
  const expiredHandled = useRef(false);

  const expired =
    typeof isSessionExpired === "function" ? isSessionExpired() : false;

  useEffect(() => {
    if (isAuthenticated && expired && !expiredHandled.current) {
      expiredHandled.current = true;
      showError(
        "Sesión expirada",
        "Su sesión ha expirado. Ingrese nuevamente.",
      );
      logout();
    }
    if (!isAuthenticated) expiredHandled.current = false; // se rearma tras el logout
  }, [isAuthenticated, expired, logout, showError]);

  // 1. Redirigir al login si no está autenticado o expiró la sesión
  if (!isAuthenticated || expired) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Redirigir si el rol no está autorizado
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // 3. Vista permitida
  return children;
}

RequireRole.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};
