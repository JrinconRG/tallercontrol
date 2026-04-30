import { useState, useEffect } from "react";
import { useObtenerHistorialProcesos } from "../../../features/procesos/application/hooks/useObtenerHistorialProcesos";
import Table from "../../../components/Table/Table";
import TableHeader from "../../../components/Table/TableHeader";
import Card from "../../../components/card/Card";
import MostrarImagenesModal from "../../../components/mostrarImagenModal/MostrarImagenModal";
import "../../Trabajador/Historial/Historial.css";

export default function HistorialGerente() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [procesoDetalle, setProcesoDetalle] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState({
    path: null,
    fase: "",
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cerrarDrawer();
      }
    };

    if (procesoDetalle) {
      globalThis.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, [procesoDetalle]);

  const { historial, loading, error } = useObtenerHistorialProcesos();
  console.log("historial", historial);

  if (loading) return <p>Cargando historial..</p>;
  if (error) return <p>Error al cargar historial..</p>;

  const cerrarDrawer = () => setProcesoDetalle(null);

  return (
    <div className="page-content-historial">
      <div className="header-page">
        <h1 className="page-tittle">Historial de Cofres</h1>
        <p className="page-mini-info">Seguimiento de procesos registrados</p>
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
        />

        <Table
          columns={[
            { key: "codigoCofre", label: "Código" },
            { key: "referenciaNombre", label: "Nombre del Cofre" },
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
              key: "totalAcumulado",
              label: "Valor Total",
              render: (row) => `$${row.totalAcumulado?.toLocaleString()}`,
            },
            {
              key: "estado",
              label: "Estado",
              render: (row) => (
                <span className="badge-finalizado">
                  {row.estado?.toUpperCase()}
                </span>
              ),
            },
          ]}
          data={historial}
          rowKey="id"
          onRowClick={(row) =>
            setProcesoDetalle({
              ...row,
              subprocesos: row.detalleSubprocesos || [],
            })
          }
        />
      </Card>

      {procesoDetalle && (
        <div className="drawer-overlay">
          <button
            className="drawer-backdrop"
            onClick={cerrarDrawer}
            aria-label="Cerrar"
          />
          <dialog className="drawer" open aria-modal="true">
            <div className="drawer-header">
              <h3>{procesoDetalle.codigoCofre}</h3>
              <button
                className="btn btn-primary"
                onClick={cerrarDrawer}
                aria-label="Cerrar detalle"
              >
                ✖
              </button>
            </div>

            <div className="drawer-body">
              <Table
                columns={[
                  { key: "cargoNombre", label: "Fase" },
                  { key: "trabajadorNombreCompleto", label: "Trabajador" },
                  {
                    key: "fechaInicio",
                    label: "Inicio",
                    render: (row) => new Date(row.fechaInicio).toLocaleString(),
                  },
                  {
                    key: "fechaFin",
                    label: "Fin",
                    render: (row) => new Date(row.fechaFin).toLocaleString(),
                  },
                  {
                    key: "valor",
                    label: "Valor",
                    render: (row) => `$${Number(row.valor).toLocaleString()}`,
                  },
                  {
                    key: "fotosEvidencia",
                    label: "Evidencia",
                    render: (row) => (
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          setImagenSeleccionada({
                            path: row.fotosEvidencia,
                            fase: row.cargoNombre,
                          })
                        }
                      >
                        Ver
                      </button>
                    ),
                  },
                ]}
                data={procesoDetalle.detalleSubprocesos}
                rowKey="id"
              />
            </div>
          </dialog>
        </div>
      )}

      <MostrarImagenesModal
        isOpen={Boolean(imagenSeleccionada.path)}
        path={imagenSeleccionada.path}
        fase={imagenSeleccionada.fase}
        onClose={() => setImagenSeleccionada({ path: null, fase: "" })}
      />
    </div>
  );
}
