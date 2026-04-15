import "./Table.css";
import PropTypes from "prop-types";

export default function Table({ columns, data, onRowClick, rowKey = "id" }) {
  return (
    <div className="table-container">
      <table className="custom-table">
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
            const key =
              typeof rowKey === "function" ? rowKey(row) : row[rowKey];
            return (
              <tr key={key ?? idx} onClick={() => onRowClick?.(row, idx)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  onRowClick: PropTypes.func,
  rowKey: PropTypes.string,
};
