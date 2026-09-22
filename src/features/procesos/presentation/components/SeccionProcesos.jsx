// SeccionProcesos.jsx
import Card from "../../../../components/card/Card";
import Pagination from "../../../../components/pagination/Pagination";
import ProcesoDetail from "../pages/ProcesoDetail";
import { usePagination } from "../../../../hooks/usePagination";
import { calcularDuracion } from "../../../../utils/tiempo";
import "./SeccionProcesos.css";
export default function SeccionProcesos({
  titulo,
  procesos,
  faseActualProcesos,
  informacionSubProcesoActual,
  onIniciarFase,
  onFinalizarFase,
}) {
  const { page, limit, paginatedData, setPage, setLimit, totalItems } =
    usePagination(procesos, 10);

  function getSubprocesoDeProcesso(proceso) {
    return (
      informacionSubProcesoActual?.find(
        (sub) => sub.idProceso === proceso.id,
      ) ?? null
    );
  }

  if (procesos.length === 0) return null;

  return (
    <div className="seccion-procesos-wrapper">
      <div className="seccion-procesos-header">
        <h3 className="title-procesos">{titulo}</h3>
        <span className="seccion-contador">
          {totalItems} cofre{totalItems !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid-procesos">
        {paginatedData.map((p) => {
          const fase = faseActualProcesos.find((f) => f.id === p.id);
          const subprocesoActual = getSubprocesoDeProcesso(p);
          const fasesCompletadas = fase?.fasesCompletadas ?? 0;
          const totalFases = fase?.totalFases ?? 1;

          const estado = () => {
            if (subprocesoActual) return "enProceso";
            if (!fase || fase.fasesCompletadas === 0) return "porIniciar";
            return "siguientFase";
          };

          return (
            <Card key={p.id} className="card-proceso">
              <ProcesoDetail
                proceso={p}
                colorTitulo={estado()}
                fase={fase}
                subprocesoActual={subprocesoActual}
                fasesCompletadas={fasesCompletadas}
                totalFases={totalFases}
                calcularDuracion={calcularDuracion}
                onIniciarFase={onIniciarFase}
                onFinalizarFase={(data) => {
                  const esUltimaFase = fasesCompletadas + 1 === totalFases;
                  onFinalizarFase({
                    ...data,
                    pro_id_proceso: p.id,
                    rc_nombre: p.referenciaNombre,
                    rc_codigo: p.referenciaCodigoNombre,
                    id_nombre_proceso: p.codigoCofre,
                    nombre_fase: fase?.siguienteCargoNombre,
                    esUltimaFase,
                  });
                }}
              />
            </Card>
          );
        })}
      </div>

      {totalItems > 10 && (
        <Pagination
          totalItems={totalItems}
          limit={limit}
          page={page}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
}
