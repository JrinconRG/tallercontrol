import PropTypes from "prop-types";
import ColorSwatch from "../../../../components/colorSwatch/ColorSwatch";
import "./CofreResumen.css";

// Identifica el cofre dentro de un modal: color + código + referencia.
export default function CofreResumen({
  codigo,
  color,
  colorHex,
  referencia,
  referenciaCodigo,
}) {
  return (
    <div className="cofre-resumen">
      <ColorSwatch color={color} colorHex={colorHex} />
      <div className="cofre-resumen-datos">
        <span className="cofre-resumen-codigo">Cofre {codigo}</span>
        {color && <span className="cofre-resumen-color">{color}</span>}
        <span className="cofre-resumen-ref">
          {referencia} · {referenciaCodigo}
        </span>
      </div>
    </div>
  );
}

CofreResumen.propTypes = {
  codigo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  colorHex: PropTypes.string,
  referencia: PropTypes.string,
  referenciaCodigo: PropTypes.string,
};
