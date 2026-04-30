import { ReferenciaCofre } from "../entities/ReferenciaCofre";

export const referenciaMapper = (raw) => {
  return new ReferenciaCofre({
    id: raw.rc_id,
    codigo: raw.rc_codigo,
    nombre: raw.rc_nombre,
    descripcion: raw.rc_descripcion,
  });
};
