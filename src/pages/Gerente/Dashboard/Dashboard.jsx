import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useGetDetallesProcesoGerente } from "../../../features/procesos/application/hooks/useObtenerDetallesProcesoGerente";
import Stepper from "../../../components/Stepper/Stepper";
import Card from "../../../components/card/Card";
import FaseDetalle from "../../../components/faseDetalle/FaseDetalle";
import MostrarImagenesModal from "../../../components/mostrarImagenModal/MostrarImagenModal";

import "./Dashboard.css";

export default function Dashboard() {
  const [faseDetalle, setFaseDetalle] = useState({});
  const [modalFotos, setModalFotos] = useState(null);

  //hook para traer los procesos activos
  const { detallesProcesoGerente, loading, error } =
    useGetDetallesProcesoGerente();
  console.log("detallesProcesoGerente", detallesProcesoGerente);

  if (loading) return <p>Cargando detalle...</p>;
  if (error) return <p>Error cargando datos</p>;

  return (
    <div className="page-content-dashboard">
      <div className="header-page">
        <h1 className="page-tittle">Panel Gerencial</h1>
        <p className="page-mini-info">Seguimiento de procesos en tiempo real</p>
      </div>

      <div className="page-content-dashboard-grid">
        {detallesProcesoGerente.map((proceso) => (
          <Card
            key={proceso.id}
            title={proceso.codigoCofre}
            description={proceso.referenciaNombre}
          >
            <Stepper
              fases={proceso.detalleSubprocesos}
              selectedId={faseDetalle[proceso.id]?.id}
              onSelectFase={(fase) => {
                setFaseDetalle((prev) => ({
                  ...prev,
                  [proceso.id]: prev[proceso.id]?.id === fase.id ? null : fase,
                }));
              }}
            />
            {faseDetalle[proceso.id] && (
              <FaseDetalle
                fase={faseDetalle[proceso.id]}
                onVerFotos={(fase) =>
                  setModalFotos({
                    path: fase.fotosEvidencia,
                    fase: fase.cargoNombre,
                  })
                }
              />
            )}
          </Card>
        ))}
      </div>
      <MostrarImagenesModal
        isOpen={!!modalFotos}
        path={modalFotos?.path}
        fase={modalFotos?.fase}
        onClose={() => setModalFotos(null)}
      />

      <Outlet />
    </div>
  );
}
