// src/components/colorSwatch/ColorSwatch.jsx
import PropTypes from "prop-types";
import "./colorSwatch.css";

// Muestra grande del color del cofre. Sin colorHex usa un gris neutro.
export default function ColorSwatch({ color, colorHex }) {
  if (!color && !colorHex) return null;

  return (
    <img
      className="color-swatch"
      alt={color ? `Color ${color}` : "Color del cofre"}
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E"
      style={colorHex ? { "--swatch-color": colorHex } : undefined}
    />
  );
}

ColorSwatch.propTypes = {
  color: PropTypes.string,
  colorHex: PropTypes.string,
};
