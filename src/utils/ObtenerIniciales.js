export function obtenerIniciales(nombreCompleto) {
  if (!nombreCompleto) return "";
  const partes = nombreCompleto.trim().split(/\s+/);
  const primera = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}

function esFechaValida(valor) {
  return !!valor && !Number.isNaN(new Date(valor).getTime());
}
