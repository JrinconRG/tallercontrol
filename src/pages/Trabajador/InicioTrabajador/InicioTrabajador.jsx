import { useEffect, useState, useReducer } from "react";
import {
  useProcesosActivos,
  useFaseActualProcesos,
} from "../../../hooks/useProcesos";
import { calcularDuracion } from "../../../utils/tiempo";
import { useSubprocesoActual } from "../../../hooks/useSubprocesos";
import { Icon } from "../../../components/ui/Icon";

import Card from "../../../components/card/Card";
import CrearProceso from "./funciones/CrearProceso";
import CrearSubproceso from "./funciones/CrearSubproceso";
import FinalizarSubproceso from "./funciones/FinalizarSubproceso";
import ProcesoDetail from "./ProcesoDetail";

import "./InicioTrabajador.css";

// FUERA DEL COMPONENTE
const MENSAJES_EXITO = {
  creado: ({ codigo, nombre }) => (
    <>
      El cofre <strong>{codigo}</strong> con referencia{" "}
      <strong>{nombre}</strong> fue creado correctamente.
    </>
  ),
  finalizado: ({ codigo, nombre }) => (
    <>
      El cofre <strong>{codigo}</strong> con referencia{" "}
      <strong>{nombre}</strong> fue finalizado correctamente.
    </>
  ),
  fase: ({ codigo, fase, nombre }) => (
    <>
      Se completó correctamente la fase <strong>{fase}</strong> del cofre{" "}
      <strong>{codigo}</strong> con referencia <strong>{nombre}</strong>.
    </>
  ),
  nuevaFase: ({ codigo, fase, nombre, nombreTrabajador }) => (
    <>
      Se inició correctamente la fase <strong>{fase}</strong> del cofre{" "}
      <strong>{codigo}</strong> con referencia <strong>{nombre}</strong> para el
      trabajador <strong>{nombreTrabajador}</strong>.
    </>
  ),
};

export default function InicioTrabajador() {
  const [modalCrearProceso, setModalCrearProceso] = useState(false);
  const [modalCrearSubproceso, setModalCrearSubproceso] = useState(false);
  const [contextoFase, setContextoFase] = useState(null);

  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [subprocesoSeleccionado, setSubprocesoSeleccionado] = useState(null);
  const [messageConfirmacion, setMessageConfirmacion] = useState(null);
  const [visible, setVisible] = useState(false);

  //funcioon abrir modal finalizar subproceso
  function abrirModalFinalizar(subproceso) {
    setSubprocesoSeleccionado({
      subproceso,
    });

    setModalFinalizar(true);
  }

  //hook para obtener procesos activos
  const {
    procesos,
    loading: loadingProcesos,
    refetch: refetchProcesos,
  } = useProcesosActivos();

  //hook para obtener fases actuales
  const {
    fases,
    loading: loadingFases,
    refetch: refetchFases,
  } = useFaseActualProcesos();

  //hook para obtener información de subproceso actual
  const {
    data: subprocesosActivos,
    loading: loadingSubprocesos,
    refetch: refetchSubprocesos,
  } = useSubprocesoActual();

  const iconos = {
    creado: "CheckCircle",
    finalizado: "PackageCheck",
    fase: "RefreshCcw",
  };

  //Actualizar duraacion cada minuto
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 60000); // cada 60 segundos
    return () => clearInterval(interval);
  }, []);

  function abrirModalIniciarFase(proceso, fase) {
    setContextoFase({ proceso, fase });
    setModalCrearSubproceso(true);
  }

  async function handleSuccess(resultado = null) {
    setMessageConfirmacion(null);
    await Promise.all([
      refetchProcesos(),
      refetchFases(),
      refetchSubprocesos(),
    ]);

    if (!resultado?.tipo) return;

    const generarMensaje = MENSAJES_EXITO[resultado.tipo];
    const mensajeGenerado = generarMensaje
      ? generarMensaje(resultado)
      : "Operacion exitosa";

    setMessageConfirmacion({
      tipo: resultado.tipo,
      contenido: mensajeGenerado,
    });

    setVisible(true);

    setTimeout(() => setVisible(false), 25000);
    setTimeout(() => setMessageConfirmacion(null), 25500);
  }

  const loading = loadingProcesos || loadingFases || loadingSubprocesos;

  if (loading) return <p>Cargando procesos…</p>;

  // dividir por secciones
  const procesosPorIniciar = [];
  const procesosEnCurso = [];

  procesos.forEach((p) => {
    const fase = fases.find((f) => f.pro_id_proceso === p.pro_id_proceso);

    const subprocesoActual = subprocesosActivos.find(
      (sub) => sub.sub_proceso_id === p.pro_id_proceso,
    );

    if (!fase || (fase.fases_completadas === 0 && !subprocesoActual)) {
      procesosPorIniciar.push(p);
    } else {
      procesosEnCurso.push(p);
    }
  });

  function renderProcesos(lista) {
    return lista.map((p) => {
      const fase = fases.find((f) => f.pro_id_proceso === p.pro_id_proceso);

      const fasesCompletadas = fase?.fases_completadas || 0;
      const totalFases = fase?.total_fases || 1;

      const subprocesoActual = subprocesosActivos.find(
        (sub) => sub.sub_proceso_id === p.pro_id_proceso,
      );

      const estado = () => {
        if (subprocesoActual) return "enProceso";
        if (!fase || fase.fases_completadas === 0) return "porIniciar";
        return "siguientFase";
      };

      return (
        <Card key={p.pro_id_proceso} className={"card-proceso"}>
          <ProcesoDetail
            proceso={p}
            colorTitulo={estado()}
            fase={fase}
            subprocesoActual={subprocesoActual}
            fasesCompletadas={fasesCompletadas}
            totalFases={totalFases}
            calcularDuracion={calcularDuracion}
            onIniciarFase={abrirModalIniciarFase}
            onFinalizarFase={(data) => {
              const esUltimaFase = fasesCompletadas + 1 === totalFases;

              abrirModalFinalizar({
                ...data,
                pro_id_proceso: p.pro_id_proceso,
                rc_nombre: p.rc_nombre,
                rc_codigo: p.rc_codigo,
                id_nombre_proceso: p.pro_codigo_cofre,
                nombre_fase: fase?.siguiente_cargo_nombre,
                esUltimaFase,
              });
            }}
          />
        </Card>
      );
    });
  }

  return (
    <div className="page-content-trabajador">
      <div className="trabajador-header">
        <div className="trabajador-header-title">
          <h1 className="page-tittle">Procesos activos</h1>
          <p className="page-mini-info">Seguimiento de cofres en curso</p>
        </div>
        <div className="trabajador-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setModalCrearProceso(true)}
          >
            Crear Proceso
          </button>
        </div>
      </div>
      {messageConfirmacion && (
        <div className={`seccion-mensaje ${visible ? "visible" : "hidden"}`}>
          <Icon name={iconos[messageConfirmacion.tipo]} size={22} />

          <p className="mensaje-confirmacion">
            {messageConfirmacion.contenido}
          </p>
        </div>
      )}

      <div className="seccion-procesos">
        <h3 className="title-procesos">Por iniciar</h3>
        <div className="grid-procesos">
          {renderProcesos(procesosPorIniciar)}
        </div>

        <h3 className="title-procesos">En curso</h3>

        <div className="grid-procesos">{renderProcesos(procesosEnCurso)}</div>
      </div>

      {modalCrearProceso && (
        <CrearProceso
          onClose={() => setModalCrearProceso(false)}
          onSuccess={handleSuccess}
        />
      )}
      {modalCrearSubproceso && (
        <CrearSubproceso
          contexto={contextoFase}
          onClose={() => setModalCrearSubproceso(false)}
          onSuccess={handleSuccess}
        />
      )}

      {modalFinalizar && (
        <FinalizarSubproceso
          subproceso={subprocesoSeleccionado}
          onClose={() => setModalFinalizar(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
