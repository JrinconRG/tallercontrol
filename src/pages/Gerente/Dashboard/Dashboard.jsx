import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useDetalleProcesos } from "../../../hooks/useProcesos";
import Stepper from "../../../components/Stepper/Stepper";
import Card from "../../../components/card/Card";
import FaseDetalle from "../../../components/FaseDetalle/FaseDetalle";
import MostrarImagenesModal from "../../../components/mostrarImagenModal/MostrarImagenModal";

import "./Dashboard.css";

export default function Dashboard() {
  const [faseDetalle, setFaseDetalle] = useState({});
  const [modalFotos, setModalFotos] = useState(null);

  //hook para traer los procesos activos
  const { procesosDetalle, loading, error } = useDetalleProcesos();

  if (loading) return <p>Cargando detalle...</p>;
  if (error) return <p>Error cargando datos</p>;

  return (
    <div className="page-content-dashboard">
      <div className="header-page">
        <h1 className="page-tittle">Panel Gerencial</h1>
        <p className="page-mini-info">Seguimiento de procesos en tiempo real</p>
      </div>

      <div className="page-content-dashboard-grid">
        {procesosDetalle.map((proceso) => (
          <Card
            key={proceso.pro_id_proceso}
            title={proceso.pro_codigo_cofre}
            description={proceso.rc_nombre}
          >
            <Stepper
              fases={proceso.fases}
              selectedId={faseDetalle[proceso.pro_id_proceso]?.sub_id}
              onSelectFase={(fase) => {
                setFaseDetalle((prev) => ({
                  ...prev,
                  [proceso.pro_id_proceso]:
                    prev[proceso.pro_id_proceso]?.sub_id === fase.sub_id
                      ? null
                      : fase,
                }));
              }}
            />
            <FaseDetalle
              fase={faseDetalle[proceso.pro_id_proceso]}
              onVerFotos={(fase) =>
                setModalFotos({ path: fase.foto, fase: fase.fase })
              }
            />
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
