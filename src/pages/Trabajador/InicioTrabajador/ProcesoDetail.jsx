import { Icon } from "../../../components/ui/Icon"
import './ProcesoDetail.css'
export default function ProcesoDetail({
    proceso,
    fase,
    subprocesoActual,
    calcularDuracion,
    onIniciarFase,
    onFinalizarFase
}) {

    const hayFaseActiva = !!subprocesoActual;
    const siguienteFase = fase?.siguiente_fase_orden;
    const siguienteNombre = fase?.siguiente_cargo_nombre;
    const estadoClase =
        proceso.pro_estado?.toLowerCase() === "activo"
            ? "badge-activo"
            : "badge-default";

    function formatearFecha(fechaIso) {
        if (!fechaIso) return "—";
        const fecha = new Date(fechaIso);
        return fecha.toLocaleDateString("es-CO",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
    }


    return (
        <div className="proceso-detail-card">

            {/* HEADER */}
            <div className="proceso-detail-header">
                <div className="content-tittle-detail">
                    <h2 className="tittle-detail-process">Cofre {proceso.rc_nombre} - {proceso.rc_codigo} </h2>


                </div>
                <div className="proceso-detail-badge">
                    <p>
                        Codigo: {proceso.pro_codigo_cofre}
                    </p>
                    <span className={`badge ${estadoClase}`}>
                        {proceso.pro_estado}
                    </span>
                </div>

                <div className="info-header">
                    <Icon name="Calendar" size={18} />
                    <span>
                        Inicio: {formatearFecha(fase?.pro_fecha_inicio)}
                    </span>
                </div>


            </div>

            <div className="divider" />

            {/* BODY */}
            <div className="proceso-detail-body">
                <div className="info-line">
                    <Icon name="Layers" size={20} />
                    <span>
                        Fase: {subprocesoActual?.c_nombre || "Sin asignar"}
                    </span>
                </div>

                <div className="info-line">
                    <Icon name="User" size={20} />
                    <span>
                        Encargado: {subprocesoActual?.t_nombre || "Sin asignar"}
                    </span>
                </div>




                <div className="info-line">
                    <Icon name="Clock" size={18} />
                    <span>
                        Duración: {calcularDuracion(subprocesoActual?.sub_fecha_inicio) || "Sin iniciar"}
                    </span>
                </div>

            </div>

            <div className="divider" />

            {/* FOOTER */}


            <div className="proceso-detail-footer">
                {hayFaseActiva ? (
                    <button
                        className="footer-action-btn terminar-boton"
                        onClick={() => onFinalizarFase(subprocesoActual)}
                    >
                        <span>Finalizar fase</span>
                        <Icon name="ArrowRight" size={25} />
                    </button>
                ) : siguienteFase ? (
                    <button
                        className="footer-action-btn iniciar-boton"
                        onClick={() => onIniciarFase(proceso, fase)}
                    >
                        <span>Siguiente fase: {siguienteNombre}</span>
                        <Icon name="ArrowRight" size={25} />
                    </button>
                ) : (
                    <div className="finalizado-container">
                        <span className="finalizado">Proceso completado</span>
                    </div>
                )}
            </div>

        </div>
    );
}
