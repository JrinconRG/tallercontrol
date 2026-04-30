import { Trabajador } from "../entities/Trabajador";

export const trabajadorPorCargoMapper = (row) => {
  return new Trabajador({
    id: row.t_id,
    nombre: row.t_nombre,
    apellidos: row.t_apellidos,
    cargoId: row.cargo_id,
  });
};
