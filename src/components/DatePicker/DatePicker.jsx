import React, { useState } from "react";
import { format, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./DatePicker.css";
const DatePicker = ({ onChange, initialRange, disabledRanges = [] }) => {
  const [range, setRange] = useState(
    initialRange?.from && initialRange?.to
      ? { from: new Date(initialRange.from), to: new Date(initialRange.to) }
      : { from: undefined, to: undefined },
  );

  const handleSelect = (newRange) => {
    if (newRange?.from && newRange?.to) {
      const hayDiaBloqueadoEnMedio = disabledRanges.some((rango) => {
        // Si el rango seleccionado rodea o cruza cualquier rango deshabilitado
        return newRange.from <= rango.to && newRange.to >= rango.from;
      });

      if (hayDiaBloqueadoEnMedio) {
        // Reiniciamos o ignoramos la selección inválida
        setRange({ from: newRange.to, to: undefined });
        onChange?.({ from: null, to: null });
        return;
      }
    }
    setRange(newRange);

    //solo notifica al padre cuando abas fechas estan seleccionada
    if (
      newRange?.from &&
      newRange?.to &&
      !isSameDay(newRange.from, newRange.to)
    ) {
      onChange?.({ from: newRange.from, to: newRange.to });
    } else {
      onChange?.({ from: null, to: null });
    }
  };

  // Genera un mensaje en el pie de página para informar al usuario
  let footer = <p>Por favor, elige el primer día.</p>;
  if (range?.from) {
    if (!range.to) {
      footer = <p>{format(range.from, "PPP")} – [Fecha de fin]</p>;
    } else if (range.to) {
      footer = (
        <p>
          {format(range.from, "PPP")}–{format(range.to, "PPP")}
        </p>
      );
    }
  }

  const reglasDeshabilitadas = [{ after: new Date() }, ...disabledRanges];

  return (
    <DayPicker
      mode="range" // Habilita el modo rango
      selected={range} // Pasa el estado del rango
      onSelect={handleSelect} // Maneja la selección de fechas
      footer={footer} // Muestra el rango seleccionado
      defaultMonth={new Date()} // Define el mes inicial a mostrar
      numberOfMonths={2}
      disabled={reglasDeshabilitadas} // Deshabilita fechas futuras y rangos pasados
      excludeDisabled
    />
  );
};

export default DatePicker;
