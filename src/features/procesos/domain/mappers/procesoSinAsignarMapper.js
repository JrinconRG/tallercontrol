import { ProcesoSinAsignar } from "../entities/ProcesoSinAsignar";

export const procesoSinAsignarMapper = (row) => {
  const {
    id,
    codigo_cofre,
    fecha_inicio,
    fecha_fin,
    referencia_nombre,
    empresa_id,
  } = row;

  return new ProcesoSinAsignar({
    id,
    codigoCofre: codigo_cofre,
    fechaInicio: fecha_inicio,
    fechaFin: fecha_fin,
    referenciaNombre: referencia_nombre,
    empresaId: empresa_id,
  });
};
