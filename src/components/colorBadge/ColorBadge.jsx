// src/components/colorBadge/ColorBadge.jsx
import PropTypes from "prop-types";
import "./colorBadge.css";

export default function ColorBadge({ color, colorHex }) {
  if (!color && !colorHex) return null;

  return (
    <span className="color-badge" style={{ "--badge-color": colorHex }}>
      <span className="color-badge-dot" />
      {color && <span className="color-badge-label">{color}</span>}
    </span>
  );
}

ColorBadge.propTypes = {
  color: PropTypes.string,
  colorHex: PropTypes.string,
};
