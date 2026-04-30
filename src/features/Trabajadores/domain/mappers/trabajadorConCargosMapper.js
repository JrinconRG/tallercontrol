import { Trabajador } from "../entities/Trabajador";

export const trabajadorConCargosMapper = (row) => {
  let cargos = [];

  try {
    const parsed =
      typeof row.cargos === "string" ? JSON.parse(row.cargos) : row.cargos;

    cargos = parsed || [];
  } catch {
    cargos = [];
  }

  return new Trabajador({
    id: row.t_id,
    nombre: row.nombre_completo,
    apellidos: "",
    documento: row.t_numero_de_documento,
    celular: row.t_celular,
    cargos,
  });
};
