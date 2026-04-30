export const trabajadorSelectMapper = (row) => ({
  value: row.t_id,
  label: row.trabajador_nombre_completo,
});
