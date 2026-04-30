import { useState } from "react";
import { useObtenerHistorialSubprocesosPendientes } from "../../../features/subProcesos/application/hooks/useObtenerHistorialSubprocesosPendientes";
import Table from "../../../components/Table/Table";
import TableHeader from "../../../components/Table/TableHeader";
import Card from "../../../components/card/Card";
import MostrarImagenesModal from "../../../components/mostrarImagenModal/MostrarImagenModal";
import "./Historial.css";
import { Icon } from "../../../components/ui/Icon";

export default function Historial() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [imagenSeleccionada, setImagenSeleccionada] = useState({
    path: null,
    fase: "",
  });

  // uso de hook personalizado para obtener el historial de subprocesos

  const { historialSubprocesosPendientes, loading, error } =
    useObtenerHistorialSubprocesosPendientes();

  if (loading) return <p>Cargando historial..</p>;
  if (error) return <p>Error al cargar: {error.message}</p>;
  if (historialSubprocesosPendientes.length === 0)
    return <p>No hay registros pendientes.</p>;

  return (
    <div className="page-content-historial">
      <div className="header-page">
        <h1 className="page-tittle"> Historial de Cofres</h1>
        <p className="page-mini-info">Seguimiento de fases registradas</p>
      </div>
      <Card className="card-historial" style={{ backgroundColor: "#ffffff" }}>
        <TableHeader
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              name: "estado",
              value: estado,
              onChange: setEstado,
              options: [],
            },
          ]}
        ></TableHeader>

        <Table
          data={historialSubprocesosPendientes}
          rowKey="id"
          columns={[
            {
              key: "codigoCofre",
              label: "Código",
            },
            {
              key: "referenciaNombre",
              label: "Nombre del Cofre",
            },
            {
              key: "duracion",
              label: "Duracion",
            },
            {
              key: "fechaInicio",
              label: "Inicio",
              render: (row) => new Date(row.fechaInicio).toLocaleDateString(),
            },
            {
              key: "fechaFin",
              label: "Fin",
              render: (row) =>
                row.fechaFin
                  ? new Date(row.fechaFin).toLocaleDateString()
                  : "-",
            },
            {
              key: "trabajadoNombreCompleto",
              label: "Nombre ",
            },
            {
              key: "cargoNombre",
              label: "Trabajo realizado ",
            },
            {
              key: "valor",
              label: "Valor Total",
              render: (row) => `$${row.valor?.toLocaleString()}`,
            },

            {
              key: "fotosEvidencia",
              label: "Evidencia",
              render: (row) => {
                // Verificar si hay fotos
                const tieneFotos =
                  row.fotosEvidencia && row.fotosEvidencia.length > 0;
                return tieneFotos ? (
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      setImagenSeleccionada({
                        path: row.fotosEvidencia,
                        fase: row.cargoNombre,
                      })
                    }
                  >
                    <Icon name={"Image"} />
                  </button>
                ) : (
                  <span className="text-muted">Sin fotos</span>
                );
              },
            },
          ]}
        />
      </Card>

      <MostrarImagenesModal
        isOpen={Boolean(imagenSeleccionada.path)}
        path={imagenSeleccionada.path}
        fase={imagenSeleccionada.fase} // Aquí pasas el nombre de la fase
        onClose={() => setImagenSeleccionada({ path: null, fase: "" })}
      />
    </div>
  );
}
