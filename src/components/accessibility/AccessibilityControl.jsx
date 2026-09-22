import { Accessibility, X } from "lucide-react";
import { useEffect, useState } from "react";
import "./AccessibilityControl.css";

const SCALE_OPTIONS = [100, 120, 150, 200];
const STORAGE_KEY = "tallercontrol-text-scale";

export default function AccessibilityControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(() => {
    const savedScale = Number(localStorage.getItem(STORAGE_KEY));
    return SCALE_OPTIONS.includes(savedScale) ? savedScale : 100;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textScale = String(scale);
    localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scale]);

  return (
    <div className="accessibility-control">
      {isOpen && (
        <section className="accessibility-panel" aria-label="Opciones de accesibilidad">
          <div className="accessibility-panel-header">
            <div>
              <h2>Accesibilidad</h2>
              <p>Tamaño del texto</p>
            </div>
            <button type="button" className="accessibility-close" aria-label="Cerrar opciones de accesibilidad" onClick={() => setIsOpen(false)}>
              <X aria-hidden="true" />
            </button>
          </div>
          <div className="accessibility-options" role="group" aria-label="Seleccionar tamaño de texto">
            {SCALE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={scale === option ? "is-selected" : ""}
                aria-pressed={scale === option}
                onClick={() => setScale(option)}
              >
                {option}%
              </button>
            ))}
          </div>
        </section>
      )}
      <button
        type="button"
        className="accessibility-trigger"
        aria-label="Abrir opciones de accesibilidad"
        aria-expanded={isOpen}
        aria-controls="accessibility-options"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Accessibility aria-hidden="true" />
        <span>Accesibilidad</span>
      </button>
    </div>
  );
}
