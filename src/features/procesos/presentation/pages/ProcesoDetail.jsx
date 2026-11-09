import { Icon } from "../../../../components/ui/Icon";
import "./ProcesoDetail.css";
import ColorSwatch from "../../../../components/colorSwatch/ColorSwatch";
import PropTypes from "prop-types";
import { obtenerIniciales } from "../../../../utils/ObtenerIniciales";

function esFechaValida(valor) {
  return !!valor && !Number.isNaN(new Date(valor).getTime());
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
  const siguienteFase = fase?.siguienteFaseOrden;
  const siguienteNombre = fase?.siguienteCargoNombre;
  const nombreFase =
    subprocesoActual?.cargoNombre ||
    fase?.siguienteCargoNombre ||
    "Sin asignar";
  const nombreTrabajador = subprocesoActual?.trabajadorNombreCompleto;

  const duracion = esFechaValida(subprocesoActual?.fechaInicio)
    ? calcularDuracion(subprocesoActual.fechaInicio)
    : null;
  const textoTiempo = hayFaseActiva
    ? duracion && duracion !== "Fecha inválida"
      ? duracion
      : "Sin hora de inicio"
    : "Aún sin iniciar";

  const renderEtiquetaLabel = () => {
    const etiquetas = {
      enProceso: "En curso",
      porIniciar: "Primera fase · sin iniciar",
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
          <span>Finalizar {subprocesoActual?.cargoNombre || "fase"}</span>
          <Icon name="ArrowRight" size={22} />
        </button>
      );
    }
    //caso 2
    if (siguienteFase) {
      return (
        <button
          type="button"
          className={`footer-action-btn btn-${colorTitulo}`}
          onClick={() => onIniciarFase(proceso, fase)}
        >
          <span>Iniciar {siguienteNombre}</span>
          <Icon name="ArrowRight" size={22} className="arrow-icon" />
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
        <ColorSwatch color={proceso.color} colorHex={proceso.colorHex} />
        <div className="cofre-datos">
          <h2 className="tittle-detail-process">Cofre {proceso.codigoCofre}</h2>
          {proceso.color && (
            <span className="cofre-color-nombre">{proceso.color}</span>
          )}
          <span className="cofre-referencia">
            {proceso.referenciaNombre} · {proceso.referenciaCodigoNombre}
          </span>
        </div>
      </div>

      {/* BODY: ¿qué toca hacer? fase + quién + desde cuándo, todo en un bloque */}
      <div className="proceso-detail-body">
        <section className={`estado-bloque ${colorTitulo}`}>
          <div className="estado-cabecera">
            <span className="estado-dot" />
            <span className="estado-etiqueta">{renderEtiquetaLabel()}</span>
          </div>

          <span className="estado-valor">{nombreFase}</span>

          <div className="estado-detalles">
            <div className="info-line">
              {nombreTrabajador ? (
                <span className="avatar-trabajador" aria-hidden="true">
                  {obtenerIniciales(nombreTrabajador)}
                </span>
              ) : (
                <span className="avatar-trabajador vacio" aria-hidden="true" />
              )}
              <span
                className={`info-proceso ${
                  nombreTrabajador ? "con-trabajador" : "sin-asignar"
                }`}
              >
                {nombreTrabajador || "Sin asignar"}
              </span>
            </div>

            <div className="info-line">
              <span className="info-icono">
                <Icon name="Clock" size={20} />
              </span>
              <span className="info-proceso">{textoTiempo}</span>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER: botón grande con el nombre de la fase */}
      <div className="proceso-detail-footer">{renderFooterContent()}</div>
    </div>
  );
}

ProcesoDetail.propTypes = {
  proceso: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    codigoCofre: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    estado: PropTypes.string,
    referenciaNombre: PropTypes.string,
    referenciaCodigoNombre: PropTypes.string,
    color: PropTypes.string,
    colorHex: PropTypes.string,
  }),
  colorTitulo: PropTypes.string,
  fase: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fechaInicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    siguienteFaseOrden: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    siguienteCargoNombre: PropTypes.string,
  }),
  subprocesoActual: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fechaInicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cargoNombre: PropTypes.string,
    trabajadorNombreCompleto: PropTypes.string,
  }),
  calcularDuracion: PropTypes.func.isRequired,
  onIniciarFase: PropTypes.func.isRequired,
  onFinalizarFase: PropTypes.func.isRequired,
};
