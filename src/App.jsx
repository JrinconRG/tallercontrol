import "./styles/variables.css";
import "./styles/layout.css";
import { Routes, Route, Navigate } from "react-router-dom";

//Layouts
import PublicLayout from "./components/layout/PublicLayout";
import PrivateLayout from "./components/layout/PrivateLayout";
import RequireRole from "./components/auth/RequireRole";
//Páginas
import LoginPage from "./pages/auth/LoginPage/LoginPage";
import InicioTrabajador from "./features/procesos/presentation/pages/InicioTrabajador";
import Historial from "./pages/Trabajador/Historial/Historial";
import Dashboard from "./pages/Gerente/Dashboard/Dashboard";
import NoAutorizado from "./pages/NoAutorizado";
import Tarifas from "./pages/Gerente/Tarifas/Tarifas";

//Gerente routes
import ProcesosTerminados from "./features/procesos/presentation/pages/ProcesosTerminados";
import Empleados from "./pages/Gerente/Empleados/Empleados";
import GenerarNomina from "./features/nomina/presentation/pages/GenerarNomina";
import HistorialGerente from "./pages/Gerente/HistorialGerente/HistorialGerente";
import DetalleNomina from "./features/nomina/presentation/pages/DetalleNomina";
import ExportarNomina from "./features/nomina/presentation/pages/ExportarNomina";
import ReferenciasCofre from "./features/cofres/presentation/pages/ReferenciasCofre";
import Clientes from "./features/clientes/presentation/pages/Clientes";
import HistorialNomina from "./features/nomina/presentation/pages/HistorialNomina";

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
          path="/gerente/procesos/terminados"
          element={
            <RequireRole allowedRoles={["gerente"]}>
              <ProcesosTerminados />
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

        <Route path="/gerente/configuracion">
          <Route index element={<Navigate to="referencias" replace />} />

          <Route
            path="referencias"
            element={
              <RequireRole allowedRoles={["gerente"]}>
                <ReferenciasCofre />
              </RequireRole>
            }
          />

          <Route
            path="clientes"
            element={
              <RequireRole allowedRoles={["gerente"]}>
                <Clientes />
              </RequireRole>
            }
          />
        </Route>

        {/* Rutas de nómina agrupadas */}
        <Route path="gerente/nomina">
          <Route index element={<Navigate to="fecha" replace />} />
          <Route
            path="fecha"
            element={
              <RequireRole allowedRoles={["gerente"]}>
                <GenerarNomina />
              </RequireRole>
            }
          />

          <Route
            path="historial"
            element={
              <RequireRole allowedRoles={["gerente"]}>
                <HistorialNomina />
              </RequireRole>
            }
          />
          <Route
            path="detalle"
            element={
              <RequireRole allowedRoles={["gerente"]}>
                <DetalleNomina />
              </RequireRole>
            }
          />
          <Route
            path="exportar"
            element={
              <RequireRole allowedRoles={["gerente"]}>
                <ExportarNomina />
              </RequireRole>
            }
          />
        </Route>
        <Route
          path="gerente/historial"
          element={
            <RequireRole allowedRoles={["gerente"]}>
              <HistorialGerente />
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
