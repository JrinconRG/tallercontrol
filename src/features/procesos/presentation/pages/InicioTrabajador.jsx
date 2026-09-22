import { useEffect, useState, useReducer, useMemo } from "react";
import { useToast } from "../../../../hooks/useToast";
import { useObtenerFaseActualProcesos } from "../../../../features/procesos/application/hooks/useObtenerFaseActualProcesos";
import { useProcesosActivos } from "../../../../features/procesos/application/hooks/useProcesosActivos";
import { useObtenerInfoSubprocesoActual } from "../../../../features/subProcesos/application/hooks/useObtenerInformacionSubprocesoActual";
import CrearProceso from "../components/CrearProceso";
import CrearSubproceso from "../components/CrearSubproceso";
import FinalizarSubproceso from "../components/FinalizarSubproceso";
import FiltrosProcesos from "../components/FiltrosProcesos";
import SeccionProcesos from "../components/SeccionProcesos";
import "./InicioTrabajador.css";

export default function InicioTrabajador() {
  const [modalCrearProceso, setModalCrearProceso] = useState(false);
  const [modalCrearSubproceso, setModalCrearSubproceso] = useState(false);
  const [contextoFase, setContextoFase] = useState(null);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [subprocesoSeleccionado, setSubprocesoSeleccionado] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filtroReferencia, setFiltroReferencia] = useState("");
  const [filtroFase, setFiltroFase] = useState("");
  const [filtroTrabajador, setFiltroTrabajador] = useState("");
  const [filtroOrden, setFiltroOrden] = useState("reciente");

  const { showToast } = useToast();

  const {
    procesos,
    loading: loadingProcesos,
    refetch: refetchProcesos,
  } = useProcesosActivos();
  const {
    faseActualProcesos,
    loading: loadingFases,
    refetch: refetchFases,
  } = useObtenerFaseActualProcesos();
  const {
    informacionSubProcesoActual,
    loading: loadingSubprocesos,
    refetch: refetchSubprocesos,
  } = useObtenerInfoSubprocesoActual();

  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(), 60000);
    return () => clearInterval(interval);
  }, []);

  // Opciones de filtros derivadas de los datos
  const opcionesReferencias = useMemo(() => {
    const unicas = [
      ...new Set(procesos.map((p) => p.referenciaNombre).filter(Boolean)),
    ];
    return unicas.map((r) => ({ value: r, label: r }));
  }, [procesos]);

  const opcionesFases = useMemo(() => {
    const fases = new Set();
    procesos.forEach((p) => {
      const fase = faseActualProcesos.find((f) => f.id === p.id);
      if (fase?.siguienteCargoNombre) fases.add(fase.siguienteCargoNombre);
      const sub = informacionSubProcesoActual?.find(
        (s) => s.idProceso === p.id,
      );
      if (sub?.cargoNombre) fases.add(sub.cargoNombre);
    });
    return [...fases].map((f) => ({ value: f, label: f }));
  }, [procesos, faseActualProcesos, informacionSubProcesoActual]);

  const opcionesTrabajadores = useMemo(() => {
    const trabajadores = new Set();
    informacionSubProcesoActual?.forEach((s) => {
      if (s.trabajadorNombreCompleto)
        trabajadores.add(s.trabajadorNombreCompleto);
    });
    return [...trabajadores].map((t) => ({ value: t, label: t }));
  }, [informacionSubProcesoActual]);

  // Filtrado y ordenamiento
  const procesosFiltrados = useMemo(() => {
    let resultado = [...procesos];

    const term = search.trim().toLowerCase();
    if (term) {
      resultado = resultado.filter(
        (p) =>
          p.codigoCofre?.toLowerCase().includes(term) ||
          p.referenciaNombre?.toLowerCase().includes(term),
      );
    }

    if (filtroReferencia) {
      resultado = resultado.filter(
        (p) => p.referenciaNombre === filtroReferencia,
      );
    }

    if (filtroFase) {
      resultado = resultado.filter((p) => {
        const fase = faseActualProcesos.find((f) => f.id === p.id);
        const sub = informacionSubProcesoActual?.find(
          (s) => s.idProceso === p.id,
        );
        return (
          fase?.siguienteCargoNombre === filtroFase ||
          sub?.cargoNombre === filtroFase
        );
      });
    }

    if (filtroTrabajador) {
      resultado = resultado.filter((p) => {
        const sub = informacionSubProcesoActual?.find(
          (s) => s.idProceso === p.id,
        );
        return sub?.trabajadorNombreCompleto === filtroTrabajador;
      });
    }

    resultado.sort((a, b) => {
      const dateA = new Date(a.fechaInicio);
      const dateB = new Date(b.fechaInicio);
      return filtroOrden === "reciente" ? dateB - dateA : dateA - dateB;
    });

    return resultado;
  }, [
    procesos,
    search,
    filtroReferencia,
    filtroFase,
    filtroTrabajador,
    filtroOrden,
    faseActualProcesos,
    informacionSubProcesoActual,
  ]);

  // Separar secciones después de filtrar
  const { procesosPorIniciar, procesosEnCurso } = useMemo(() => {
    const porIniciar = [];
    const enCurso = [];

    procesosFiltrados.forEach((p) => {
      const fase = faseActualProcesos.find((f) => f.id === p.id);
      const sub = informacionSubProcesoActual?.find(
        (s) => s.idProceso === p.id,
      );
      if (!fase || (fase.fasesCompletadas === 0 && !sub)) {
        porIniciar.push(p);
      } else {
        enCurso.push(p);
      }
    });

    return { procesosPorIniciar: porIniciar, procesosEnCurso: enCurso };
  }, [procesosFiltrados, faseActualProcesos, informacionSubProcesoActual]);

  const hayFiltros =
    search || filtroReferencia || filtroFase || filtroTrabajador;

  const limpiarFiltros = () => {
    setSearch("");
    setFiltroReferencia("");
    setFiltroFase("");
    setFiltroTrabajador("");
    setFiltroOrden("reciente");
  };

  function abrirModalIniciarFase(proceso, fase) {
    setContextoFase({ proceso, fase });
    setModalCrearSubproceso(true);
  }

  function abrirModalFinalizar(subproceso) {
    setSubprocesoSeleccionado({ subproceso });
    setModalFinalizar(true);
  }

  async function handleSuccess(resultado = null) {
    await Promise.all([
      refetchProcesos(),
      refetchFases(),
      refetchSubprocesos(),
    ]);
    if (!resultado?.tipo) return;
    const mensajes = {
      creado: `Cofre ${resultado.codigo} (${resultado.nombre}) creado correctamente.`,
      finalizado: `Cofre ${resultado.codigo} (${resultado.nombre}) finalizado correctamente.`,
      fase: `Fase ${resultado.fase} del cofre ${resultado.codigo} completada correctamente.`,
      nuevaFase: `Fase ${resultado.fase} del cofre ${resultado.codigo} iniciada para ${resultado.nombreTrabajador}.`,
    };
    const tipos = {
      creado: "created",
      nuevaFase: "started",
      fase: "completed",
      finalizado: "completed",
    };
    const titulos = {
      creado: "Proceso creado",
      nuevaFase: "Fase iniciada",
      fase: "Fase completada",
      finalizado: "Proceso finalizado",
    };
    showToast({
      title: titulos[resultado.tipo] ?? "Operación completada",
      message:
        mensajes[resultado.tipo] ?? "La operación se completó correctamente.",
      type: tipos[resultado.tipo] ?? "success",
      size: "large",
    });
  }

  const loading = loadingProcesos || loadingFases || loadingSubprocesos;
  if (loading) return <p>Cargando procesos…</p>;

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

      <div className="trabajador-filtros">
        <FiltrosProcesos
          search={search}
          onSearchChange={setSearch}
          filtroReferencia={filtroReferencia}
          onFiltroReferenciaChange={setFiltroReferencia}
          filtroFase={filtroFase}
          onFiltroFaseChange={setFiltroFase}
          filtroTrabajador={filtroTrabajador}
          onFiltroTrabajadorChange={setFiltroTrabajador}
          filtroOrden={filtroOrden}
          onFiltroOrdenChange={setFiltroOrden}
          opcionesReferencias={opcionesReferencias}
          opcionesFases={opcionesFases}
          opcionesTrabajadores={opcionesTrabajadores}
          hayFiltros={hayFiltros}
          onLimpiar={limpiarFiltros}
        />
      </div>

      <SeccionProcesos
        titulo="Por iniciar"
        procesos={procesosPorIniciar}
        faseActualProcesos={faseActualProcesos}
        informacionSubProcesoActual={informacionSubProcesoActual}
        onIniciarFase={abrirModalIniciarFase}
        onFinalizarFase={abrirModalFinalizar}
      />

      <SeccionProcesos
        titulo="En curso"
        procesos={procesosEnCurso}
        faseActualProcesos={faseActualProcesos}
        informacionSubProcesoActual={informacionSubProcesoActual}
        onIniciarFase={abrirModalIniciarFase}
        onFinalizarFase={abrirModalFinalizar}
      />

      {procesosFiltrados.length === 0 && (
        <p
          style={{
            textAlign: "center",
            color: "var(--neutral-500)",
            padding: "40px 0",
          }}
        >
          No hay procesos que coincidan con los filtros.
        </p>
      )}

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
