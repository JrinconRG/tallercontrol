

import "./styles/variables.css";
import "./styles/layout.css";
import { Routes, Route } from "react-router-dom";
//Layouts
import PublicLayout from "./components/layout/PublicLayout";
import PrivateLayout from "./components/layout/PrivateLayout";
import RequireRole from "./components/auth/RequireRole";

import LoginPage from "./pages/auth/LoginPage/LoginPage";
import InicioTrabajador from "./pages/Trabajador/InicioTrabajador/InicioTrabajador";
import Gerente from "./pages/Gerente/Gerente";
import NoAutorizado from "./pages/NoAutorizado";

function App() {
  return (
    <Routes>
      {/* PÚBLICO */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      {/* PRIVADO */}
      <Route element={<PrivateLayout />}>
        <Route
          path="/gerente"
          element={
            <RequireRole allowedRoles={["gerente"]}>
              <Gerente />
            </RequireRole>
          }
        />

        <Route
          path="/InicioTrabajador"
          element={
            <RequireRole allowedRoles={["trabajador"]}>
              <InicioTrabajador />
            </RequireRole>
          }
        />

        <Route path="/no-autorizado" element={<NoAutorizado />} />
      </Route>
    </Routes>
  );
}

export default App;

