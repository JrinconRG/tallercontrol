import { Cargo } from "../entities/Cargo";

export const cargoMapper = (raw) =>
  new Cargo({
    id: raw.c_id,
    nombre: raw.c_nombre,
  });
