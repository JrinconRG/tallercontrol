import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuthStore } from "../../stores/authStore.js";

export default function PrivateLayout() {
    const { isAuthenticated, role } = useAuthStore();
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
      }

      return (
        <div className="app-layout">
          <Sidebar role={role} />
          <Header />

          <div className="main-content">
            <Outlet />
          </div>
        </div>
      );
    }
    

