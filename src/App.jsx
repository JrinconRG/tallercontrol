import "./styles/variables.css";
import "./styles/layout.css";
import { Routes, Route } from "react-router-dom";
//Layouts
import PublicLayout from "./components/layout/PublicLayout";
import PrivateLayout from "./components/layout/PrivateLayout";
import RequireRole from "./components/auth/RequireRole";
//Páginas
import LoginPage from "./pages/auth/LoginPage/LoginPage";
import InicioTrabajador from "./pages/Trabajador/InicioTrabajador/InicioTrabajador";
import Historial from "./pages/Trabajador/Historial/Historial";
import Dashboard from "./pages/Gerente/Dashboard/Dashboard";
import NoAutorizado from "./pages/NoAutorizado";
import Tarifas from "./pages/Gerente/Tarifas/Tarifas";

//Gerente routes
import Empleados from "./pages/Gerente/Empleados/Empleados";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      {/* PRIVADO */}
      <Route element={<PrivateLayout />}>
        {/* GERENTE */}
        <Route
          path="/gerente"
          element={
            <RequireRole allowedRoles={["gerente"]}>
              <Dashboard />
            </RequireRole>
          }
        />

        <Route
          path="/gerente/empleados"
          element={
            <RequireRole allowedRoles={["gerente"]}>
              <Empleados />
            </RequireRole>
          }
        />

        <Route
          path="/gerente/tarifas"
          element={
            <RequireRole allowedRoles={["gerente"]}>
              <Tarifas />
            </RequireRole>
          }
        />

        <Route
          path="/trabajador/inicio"
          element={
            <RequireRole allowedRoles={["trabajador"]}>
              <InicioTrabajador />
            </RequireRole>
          }
        />
        <Route
          path="/trabajador/historial"
          element={
            <RequireRole allowedRoles={["trabajador"]}>
              <Historial />
            </RequireRole>
          }
        />

        <Route path="/no-autorizado" element={<NoAutorizado />} />
      </Route>
    </Routes>
  );
}

export default App;
