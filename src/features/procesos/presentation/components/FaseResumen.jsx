import PropTypes from "prop-types";
import "./FaseResumen.css";

// Bloque que destaca la fase sobre la que actúa el modal.
export default function FaseResumen({ etiqueta = "Fase a iniciar", nombre }) {
  return (
    <div className="fase-resumen">
      <div className="fase-resumen-cabecera">
        <span className="fase-resumen-dot" />
        <span className="fase-resumen-etiqueta">{etiqueta}</span>
      </div>
      <span className="fase-resumen-nombre">{nombre}</span>
    </div>
  );
}

FaseResumen.propTypes = {
  etiqueta: PropTypes.string,
  nombre: PropTypes.string.isRequired,
};
