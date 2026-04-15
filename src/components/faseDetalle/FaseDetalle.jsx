import { Icon } from "../ui/Icon";
import "./FaseDetalle.css";
import PropTypes from "prop-types";

const normalize = (e = "") => e.toLowerCase();

function Chip({ iconName, label, value, estado }) {
  return (
    <div className="fd-chip">
      {iconName && <Icon name={iconName} size={20} />}
      {estado && <span className={`fd-chip-dot fd-chip-dot--${estado}`} />}
      <span className="fd-chip-label">{label}</span>
      {value && <strong className="fd-chip-value">{value}</strong>}
    </div>
  );
}

export default function FaseDetalle({ fase, onVerFotos }) {
  if (!fase) return null;
  const estado = normalize(fase.estado ?? "pendiente");

  const tieneFotos = Array.isArray(fase.foto)
    ? fase.foto.length > 0
    : !!fase.foto;

  let cantFotos = 0;
  if (Array.isArray(fase.foto)) {
    cantFotos = fase.foto.length;
  } else if (fase.foto) {
    cantFotos = 1;
  }
  const renderEstado = (() => {
    if (estado === "finalizado") return "Completado";
    if (estado === "en_proceso") return "En progreso";
    return "Pendiente";
  })();

  return (
    <div className={`fd-panel fd-panel--${estado}`}>
      <div className="fd-chips">
        <Chip estado={estado} label={renderEstado} />
        {fase.trabajador ? (
          <Chip iconName="User" label={fase.trabajador} />
        ) : (
          <Chip iconName="UserX" label="Sin asignar" />
        )}

        {estado === "en_proceso" && fase.fecha_inicio && (
          <Chip
            iconName="Timer"
            label="Transcurridos"
            value={calcularTranscurrido(fase.fecha_inicio)}
          />
        )}

        {estado === "finalizado" && fase.duracion != null && (
          <Chip
            iconName="Clock"
            label="Duración"
            value={formatearMinutos(fase.duracion)}
          />
        )}

        {fase.fecha_inicio && (
          <Chip
            iconName="CalendarDays"
            label="Inicio"
            value={formatearFecha(fase.fecha_inicio)}
          />
        )}

        {estado === "finalizado" && fase.fecha_fin && (
          <Chip
            iconName="CalendarCheck"
            label="Fin"
            value={formatearFecha(fase.fecha_fin)}
          />
        )}

        {fase.valor != null && (
          <Chip
            iconName="DollarSign"
            label="Valor"
            value={`$${Number(fase.valor).toLocaleString("es-CO")}`}
          />
        )}
      </div>
      {/* Botón de fotos — solo si está finalizado y hay fotos */}
      {estado === "finalizado" && tieneFotos && (
        <button
          type="button"
          className="fd-fotos-btn"
          onClick={() => onVerFotos?.(fase)}
        >
          <Icon name="Images" size={20} />
          Ver fotos de evidencia ({cantFotos})
        </button>
      )}

      {/* Aviso si está en proceso — fotos disponibles al terminar */}
      {estado === "en_proceso" && (
        <p className="fd-hint">
          <Icon name="Info" size={20} />
          Las fotos de evidencia estarán disponibles al completar la fase
        </p>
      )}
    </div>
  );
}

/* ── Helpers de formato ── */
function formatearFecha(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatearMinutos(min) {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function calcularTranscurrido(fechaInicio) {
  const diff = Math.floor((Date.now() - new Date(fechaInicio)) / 60000);
  return formatearMinutos(diff);
}

FaseDetalle.propTypes = {
  fase: PropTypes.shape({
    fase: PropTypes.string,
    estado: PropTypes.string,
    trabajador: PropTypes.string,
    duracion: PropTypes.number,
    fecha_inicio: PropTypes.string,
    fecha_fin: PropTypes.string,
    valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    foto: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  }),
  onVerFotos: PropTypes.func,
};
Chip.propTypes = {
  iconName: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  estado: PropTypes.string,
};
