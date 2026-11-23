/** Minúsculas y sin tildes */
export const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
