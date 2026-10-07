// domain/mappers/NominaTareaMapper.js
import { NominaTarea } from "../entities/NominaTarea";

export const NominaTareaMapper = (data) =>
  new NominaTarea({
    trabajadorId: data?.trabajador_id ?? null,
    codigoCofre: data?.codigo_cofre ?? "",
    referencia: data?.referencia ?? "",
    color: data?.color ?? null, // NULL si el cofre no tiene color
    cargo: data?.cargo ?? "",
    valor: data?.valor ?? 0,
    fechaFin: data?.fecha_fin ?? null,
    dia: data?.dia ?? null,
  });
