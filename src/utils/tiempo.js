export function calcularDuracion(fechaInicio) {
  if (!fechaInicio) return "Sin Iniciar";

  const fechaStr = fechaInicio.includes("Z") ? fechaInicio : fechaInicio + "Z";
  const inicio = new Date(fechaStr);
  const ahora = new Date();
  const fechita = inicio.getTime();

  if (Number.isNaN(fechita)) return "Fecha inválida";

  const diffMs = ahora - inicio;
  if (diffMs < 0) return "0 min";

  const minutos = Math.floor(diffMs / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) return `${dias}d ${horas % 24}h`;
  if (horas > 0) return `${horas}h ${minutos % 60}min`;
  return `${minutos} min`;
}
