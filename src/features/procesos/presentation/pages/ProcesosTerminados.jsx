import { useState } from "react";
import TablaProcesosSinAsignar from "../components/TablaProcesosSinAsignar";
import TablaHistorialPedidos from "../../../pedido/presentation/components/TablaHistorialPedidos";
import "./ProcesosTerminados.css";

export default function ProcesosTerminados() {
  const [activeTab, setActiveTab] = useState("pendientes"); // "pendientes" | "pedidos"

  return (
    <div className="page-content-procesos-terminados">
      {/* Encabezado General */}
      <div className="header-page">
        <h1 className="page-tittle">Procesos Terminados</h1>
        <p className="page-mini-info">
          Asigna cada cofre terminado a su cliente correspondiente o revisa el
          historial de pedidos.
        </p>
      </div>

      {/* Control de Pestañas (Tabs) */}
      <div className="tabs-container">
        <button
          type="button"
          className={`tab-button ${activeTab === "pendientes" ? "active" : ""}`}
          onClick={() => setActiveTab("pendientes")}
        >
          Cofres por Asignar
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "pedidos" ? "active" : ""}`}
          onClick={() => setActiveTab("pedidos")}
        >
          Historial de Pedidos
        </button>
      </div>

      {activeTab === "pendientes" ? (
        <TablaProcesosSinAsignar />
      ) : (
        <TablaHistorialPedidos />
      )}
    </div>
  );
}
