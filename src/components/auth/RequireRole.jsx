import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import PropTypes from "prop-types";

export function RequireRole({ allowedRoles, children }) {
  const { role, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
export default RequireRole;

RequireRole.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};
