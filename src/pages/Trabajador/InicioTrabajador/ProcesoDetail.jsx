import { Icon } from "../../../components/ui/Icon";
import "./ProcesoDetail.css";
import PropTypes from "prop-types";

function formatearFecha(fechaIso) {
  if (!fechaIso) return "—";
  const fecha = new Date(fechaIso);
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProcesoDetail({
  proceso,
  colorTitulo,
  fase,
  subprocesoActual,
  calcularDuracion,
  onIniciarFase,
  onFinalizarFase,
}) {
  const hayFaseActiva = !!subprocesoActual;
  const siguienteFase = fase?.siguiente_fase_orden;
  const siguienteNombre = fase?.siguiente_cargo_nombre;
  const estadoClase =
    proceso.pro_estado?.toLowerCase() === "activo"
      ? "badge-activo"
      : "badge-default";

  const renderEtiquetaLabel = () => {
    const etiquetas = {
      enProceso: "Fase activa",
      porIniciar: "Sin iniciar",
    };

    return etiquetas[colorTitulo] || "Siguiente fase";
  };

  const renderFooterContent = () => {
    //caso 1
    if (hayFaseActiva) {
      return (
        <button
          className="footer-action-btn terminar-boton"
          onClick={() => onFinalizarFase(subprocesoActual)}
        >
          <span>Finalizar fase</span>
          <Icon name="ArrowRight" size={25} />
        </button>
      );
    }
    //caso 2
    if (siguienteFase) {
      return (
        <button
          className={`footer-action-btn btn-${colorTitulo}`}
          onClick={() => onIniciarFase(proceso, fase)}
        >
          <span>Siguiente fase: {siguienteNombre}</span>
          <Icon name="ArrowRight" size={18} className="arrow-icon" />
        </button>
      );
    }
    // caso 3 el de dsi ninguna de las anteriores es q esta completado
    return (
      <div className="finalizado-container">
        <span className="finalizado">Proceso completado</span>
      </div>
    );
  };

  return (
    <div
      className={`proceso-detail-card 
    ${colorTitulo}`}
    >
      {/* HEADER */}
      <div className="proceso-detail-header">
        <div className="content-tittle-detail ">
          <h2 className="tittle-detail-process">
            Cofre {proceso.pro_codigo_cofre}
          </h2>
        </div>
        <div className="proceso-detail-badge">
          <p>
            {proceso.rc_nombre} - {proceso.rc_codigo}{" "}
          </p>
          <span className={`badge ${estadoClase}`}>{proceso.pro_estado}</span>
        </div>

        <div className="info-header">
          <Icon name="Calendar" size={18} />
          <span>Inicio: {formatearFecha(fase?.pro_fecha_inicio)}</span>
        </div>
      </div>

      <div className="divider" />

      {/* BODY */}

      <div className="proceso-detail-body">
        {/* Bloque de estado — lo más importante, grande y con color */}
        <div className={`estado-bloque ${colorTitulo}`}>
          <div className="estado-dot" />
          <div className="estado-texto">
            <span className="estado-etiqueta">{renderEtiquetaLabel()}</span>
            <span className="estado-valor">
              {subprocesoActual?.c_nombre ||
                fase?.siguiente_cargo_nombre ||
                "Sin asignar"}
            </span>
          </div>
        </div>

        <div className="info-line">
          <Icon name="User" size={20} />
          <span className="info-proceso">
            {subprocesoActual?.t_nombre || "Sin asignar"}
          </span>
        </div>

        <div className="info-line">
          <Icon name="Clock" size={18} />
          <span className="info-proceso">
            {calcularDuracion(subprocesoActual?.sub_fecha_inicio) ||
              "Sin iniciar"}
          </span>
        </div>
      </div>

      <div className="divider" />

      {/* FOOTER */}

      <div className="proceso-detail-footer">{renderFooterContent()}</div>
    </div>
  );
}
ProcesoDetail.propTypes = {
  proceso: PropTypes.shape({
    pro_estado: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
      .isRequired,

    pro_codigo_cofre: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,

    rc_nombre: PropTypes.string,

    rc_codigo: PropTypes.string,
  }),
  colorTitulo: PropTypes.string,

  fase: PropTypes.shape({
    siguiente_fase_orden: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,

    pro_fecha_inicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,

    siguiente_cargo_nombre: PropTypes.string.isRequired,
  }),
  subprocesoActual: PropTypes.shape({
    c_nombre: PropTypes.string.isRequired,
    sub_fecha_inicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,

    t_nombre: PropTypes.string.isRequired,
  }),
  //funciones
  calcularDuracion: PropTypes.func.isRequired,
  onIniciarFase: PropTypes.func.isRequired,
  onFinalizarFase: PropTypes.func.isRequired,
};
