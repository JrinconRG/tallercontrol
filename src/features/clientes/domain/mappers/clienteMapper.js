import { Cliente } from "../entities/Cliente";

export const clienteMapper = (raw) =>
  new Cliente({
    id: raw.id,
    nombre: raw.nombre,
    celular: raw.celular,
    direccion: raw.direccion,
    activo: raw.activo,
  });
