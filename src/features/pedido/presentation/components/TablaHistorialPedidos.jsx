import { useState, useMemo, useEffect } from "react";
import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import Pagination from "../../../../components/pagination/Pagination";
import Card from "../../../../components/card/Card";
import { usePagination } from "../../../../hooks/usePagination";
import { formatFechaCorta } from "../../../../utils/formatearFechas";
import { useObtenerPedidos } from "../../application/hooks/useObtenerPedidos";
import { CofresCell } from "./CofresCell";
import DetallePedidoDrawer from "./DetallePedidoDrawer";

export default function TablaHistorialPedidos() {
  const [search, setSearch] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const { pedidos = [], loading, error, errorMessage } = useObtenerPedidos();

  const pedidosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pedidos;
    return pedidos.filter(
      (p) =>
        String(p.id).toLowerCase().includes(term) ||
        (p.clienteNombre || "").toLowerCase().includes(term) ||
        (p.creadoPorNombre || "").toLowerCase().includes(term),
    );
  }, [pedidos, search]);

  const { page, limit, paginatedData, setPage, setLimit, totalItems } =
    usePagination(pedidosFiltrados, 10);

  useEffect(() => {
    setPage(1);
  }, [search, setPage]);

  const columns = [
    { key: "id", label: "N° Pedido" },
    { key: "clienteNombre", label: "Cliente", wrap: true, minWidth: 180 },
    {
      key: "totalCofres",
      label: "Cant. Cofres",
      align: "center",
      render: (row) => row.cofres?.length ?? row.totalCofres,
    },
    {
      key: "cofres",
      label: "Contenido principal",
      wrap: true,
      minWidth: 280,
      render: (row) => <CofresCell cofres={row.cofres} />,
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (row) => formatFechaCorta(row.fecha),
    },
    { key: "creadoPorNombre", label: "Registrado Por", wrap: true },
  ];

  if (loading) return <p>Cargando historial de pedidos...</p>;
  if (error) return <p>Error al cargar el historial: {errorMessage}</p>;

  return (
    <div className="page-procesos-terminados-body">
      <Card>
        <TableHeader
          searchValue={search}
          onSearchChange={setSearch}
          filters={[]}
        />

        <Table
          columns={columns}
          data={paginatedData}
          rowKey="id"
          selectedId={pedidoSeleccionado?.id}
          onRowClick={setPedidoSeleccionado}
        />

        {totalItems === 0 && (
          <p className="procesos-terminados-empty">
            {search
              ? "No hay pedidos que coincidan con la búsqueda."
              : "No se han registrado pedidos en el sistema."}
          </p>
        )}

        {totalItems > 0 && (
          <Pagination
            totalItems={totalItems}
            limit={limit}
            page={page}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </Card>

      {pedidoSeleccionado && (
        <DetallePedidoDrawer
          key={pedidoSeleccionado.id}
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </div>
  );
}
