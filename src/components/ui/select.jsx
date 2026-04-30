import "./select.css";
import { Icon } from "../ui/Icon";
import PropTypes from "prop-types";

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
}) {
  return (
    <div className="select-wrapper">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="select-filter"
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {(options ?? []).map((opt, index) => {
          const safeValue =
            opt?.value !== undefined && opt?.value !== null
              ? opt.value
              : `fallback-${index}`;

          const safeLabel = opt?.label ?? "Sin nombre";

          return (
            <option key={`${safeValue}-${index}`} value={safeValue}>
              {safeLabel}
            </option>
          );
        })}
      </select>

      <Icon name="ChevronDown" size={16} className="select-icon" />
    </div>
  );
}

Select.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    }),
  ),
  placeholder: PropTypes.string,
};
