import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import Pagination from "../../../../components/pagination/Pagination";
import Card from "../../../../components/card/Card";
import { useObtenerPedidos } from "../../application/hooks/useObtenerPedidos";
import { CofresCell } from "./CofresCell";
export default function TablaHistorialPedidos() {
  const { pedidos, loading, error, errorMessage } = useObtenerPedidos();
  console.log("pedidos", pedidos);

  const columns = [
    { key: "id", label: "N° Pedido" },
    { key: "clienteNombre", label: "Cliente" },
    { key: "totalCofres", label: "Cant. Cofres" },
    {
      key: "cofres",
      label: "Cofres ",
      render: (row) => <CofresCell cofres={row.cofres} />,
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (row) =>
        row.fecha
          ? new Date(row.fecha).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    { key: "creadoPorNombre", label: "Registrado Por" },
  ];

  if (loading) return <p>Cargando historial de pedidos...</p>;
  if (error) return <p>Error al cargar el historial: {errorMessage}</p>;

  return (
    <div className="page-procesos-terminados-body">
      <Card>
        <div className="page-procesos-terminados-card">
          <TableHeader searchValue="" onSearchChange={() => {}} filters={[]} />

          <Table columns={columns} data={pedidos} rowKey="id" />

          {pedidos.length === 0 && (
            <p className="procesos-terminados-empty">
              No se han registrado pedidos en el sistema.
            </p>
          )}

          <Pagination
            totalItems={pedidos.length}
            limit={10}
            page={1}
            onPageChange={() => {}}
            onLimitChange={() => {}}
          />
        </div>
      </Card>
    </div>
  );
}
