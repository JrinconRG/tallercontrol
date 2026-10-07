export default function Table({
  columns,
  data,
  onRowClick,
  rowKey = "id",
  selectedId,
  footer,
  footerSpacer = false, // fila vacía entre el cuerpo y el footer (opcional)
  tableClassName = "",
}) {
  return (
    <div className="table-responsive-wrapper">
      <table className={`custom-table ${tableClassName}`.trim()}>
        <thead>
          <tr>
            {columns?.map((col) => (
              <th key={col.key} className={col.className}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row, idx) => {
            const key = String(
              typeof rowKey === "function" ? rowKey(row) : row[rowKey],
            );
            const isSelected =
              selectedId !== undefined && String(selectedId) === key;

            return (
              <tr
                key={key ?? idx}
                onClick={() => onRowClick?.(row, idx)}
                className={isSelected ? "row-selected" : ""}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        {footer && (
          <tfoot>
            {footerSpacer && (
              <tr className="table-footer-spacer" aria-hidden="true">
                <td colSpan={columns?.length ?? 1} />
              </tr>
            )}
            <tr className="table-footer-row">
              {footer.map((cell, idx) => (
                <td key={idx} className={cell.className}>
                  {cell.content}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
