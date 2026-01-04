import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import "./styles/variables.css";
import "./styles/layout.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Header />

      <main className="main-content">
        {/* Aquí va cada pantalla */}
        Contenido principal
      </main>
    </div>
  );
}

export default App;
