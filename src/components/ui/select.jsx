import { useState, useRef, useEffect, useLayoutEffect } from "react";
import "./select.css";
import { Icon } from "../ui/Icon";
import PropTypes from "prop-types";

export default function Select({
  id,

  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("down");
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const safeOptions = (options ?? []).map((opt, index) => ({
    value:
      opt?.value !== undefined && opt?.value !== null
        ? opt.value
        : `fallback-${index}`,
    label: opt?.label ?? "Sin nombre",
    color: opt?.color, // opcional: hex del color (ej. "#3b82f6")
  }));

  const seleccionada = safeOptions.find((opt) => opt.value == value);

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Calcular si abre hacia arriba o hacia abajo según espacio disponible
  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const espacioAbajo = window.innerHeight - rect.bottom;
    const espacioArriba = rect.top;
    const alturaEstimada = Math.min(
      (listRef.current?.scrollHeight ?? 240) + 8,
      240,
    );

    if (espacioAbajo < alturaEstimada && espacioArriba > espacioAbajo) {
      setDirection("up");
    } else {
      setDirection("down");
    }
  }, [open]);

  function handleSelect(opt) {
    onChange(opt.value);
    setOpen(false);
  }

  function handleToggle() {
    setOpen((prev) => !prev);
  }

  return (
    <div className="select-wrapper" ref={wrapperRef}>
      <button
        id={id}
        type="button"
        className="select-filter select-trigger"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="select-trigger-content">
          {seleccionada?.color && (
            <span
              className="select-swatch"
              style={{ backgroundColor: seleccionada.color }}
            />
          )}
          <span className={seleccionada ? "" : "select-placeholder"}>
            {seleccionada ? seleccionada.label : placeholder}
          </span>
        </span>
      </button>

      <Icon name="ChevronDown" size={16} className="select-icon" />

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className={`select-options select-options--${direction}`}
        >
          {safeOptions.length === 0 && (
            <li className="select-option select-option--empty">Sin opciones</li>
          )}
          {safeOptions.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value == value}
              className={`select-option ${
                opt.value == value ? "select-option--selected" : ""
              }`}
              onClick={() => handleSelect(opt)}
            >
              {opt.color && (
                <span
                  className="select-swatch"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              <span>{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
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
      color: PropTypes.string,
    }),
  ),
  placeholder: PropTypes.string,
};
