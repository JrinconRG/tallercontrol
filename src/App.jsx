

import "./styles/variables.css";
import "./styles/layout.css";
import { Routes, Route } from "react-router-dom";
//Layouts
import PublicLayout from "./components/layout/PublicLayout";

import GerenteLayout from "./components/layout/GerenteLayout";
import TrabajadorLayout from "./components/layout/TrabajadorLayout";
//Pages 
import LoginPage from "./pages/auth/LoginPage";
import InicioTrabajador from "./pages/Trabajador/InicioTrabajador/InicioTrabajador";
import Gerente from "./pages/Gerente/Gerente";

function App() {
  return (
    <Routes>
      {/* PÚBLICO */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      {/* PRIVADO */}
      <Route element={<GerenteLayout />}>
        <Route path="/gerente" element={<Gerente />} />
      </Route>

      <Route element={<TrabajadorLayout />}>
        <Route path="/InicioTrabajador" element={<InicioTrabajador />} />
      </Route>
    </Routes>
  );
}

export default App;

