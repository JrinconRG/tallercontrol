// DetalleNominaGeneradaMapper.js
export const DetalleNominaGeneradaMapper = (data) => ({
  nombre: data?.nombre ?? "",
  documento: data?.documento ?? "",
  valorBase: data?.valor_base ?? 0,
  bonificacion: data?.bonificacion ?? 0,
  deduccion: data?.deduccion ?? 0,
  totalPagar: data?.total_pagar ?? 0,
});
