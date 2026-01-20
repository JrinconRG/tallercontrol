import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export function RequireRole({allowedRoles, children}) {
    const {role, isAuthenticated} = useAuthStore();
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }
    return children;
}
export default RequireRole;