export const matrizPreciosMapper = (raw) => {
  return {
    cargos: raw.cargos ?? [],
    referencias: raw.referencias ?? [],
    trabajador: raw.trabajador ?? null,
    precios: raw.precios ?? {},
  };
};
