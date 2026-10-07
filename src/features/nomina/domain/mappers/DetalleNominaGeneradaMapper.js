// domain/mappers/DetalleNominaGeneradaMapper.js
import { NominaDetalle } from "../entities/NominaDetalle";

export const DetalleNominaGeneradaMapper = (data) =>
  new NominaDetalle({
    nominaDetalleId: null,
    nominaId: null,
    trabajadorId: data?.trabajador_id ?? null,
    nombre: data?.nombre ?? "",
    documento: data?.documento ?? "",
    valorBase: data?.valor_base,
    bonificacion: data?.bonificacion,
    deduccion: data?.deduccion,
    transporte: data?.transporte,
    seguridadSocial: data?.seguridad_social,
    observaciones: data?.observaciones,
    totalPagar: data?.total_pagar,
  });
