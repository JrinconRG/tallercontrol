import './Table.css';

export default function Table({ columns, data, onRowClick }) {
    return (
        <div className="table-container">
            <table className="custom-table">
                <thead>
                    <tr>
                        {columns?.map(col => (
                            <th key={col.key} className={col.className}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data?.map((row, idx) => (
                        <tr key={idx} onClick={() => onRowClick?.(row)}>
                            {columns.map(col => (
                                <td key={col.key} className={col.className}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}