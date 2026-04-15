import React, { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

const DatePicker = () => {
  const [range, setRange] = useState({
    from: undefined,
    to: undefined,
  });

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

  return (
    <DayPicker
      mode="range" // Habilita el modo rango
      selected={range} // Pasa el estado del rango
      onSelect={setRange} // Maneja la selección de fechas
      footer={footer} // Muestra el rango seleccionado
      defaultMonth={new Date()} // Define el mes inicial a mostrar
      numberOfMonths={2}
    />
  );
};

export default DatePicker;
