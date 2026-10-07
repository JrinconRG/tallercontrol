import "./Card.css";
import PropTypes from "prop-types";

export default function Card({
  title,
  description,
  badge,
  children,
  className = "",
  style = {},
  borderColor,
}) {
  return (
    <div
      className={`card ${badge ? "card--with-badge" : ""} ${className}`}
      style={{
        border: borderColor
          ? `2px solid ${borderColor}`
          : `2px solid var(--neutral-400)`,
        ...style,
      }}
    >
      <div className="card-title">
        <h3 className="card-title-text">{title}</h3>
        {badge && <div className="card-badge-slot">{badge}</div>}
      </div>

      {description && (
        <div className="card-description">
          <p className="card-description-text">{description}</p>
        </div>
      )}

      <div className="card-body">{children}</div>
    </div>
  );
}

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  badge: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  borderColor: PropTypes.string,
};
