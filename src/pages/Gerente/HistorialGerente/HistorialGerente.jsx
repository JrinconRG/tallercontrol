import { useState, useEffect } from "react";
import { useHistorialProcesos } from "../../../hooks/useProcesos";
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

  const { historial, loading, error } = useHistorialProcesos();

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
            { key: "pro_codigo_cofre", label: "Código" },
            { key: "rc_nombre", label: "Nombre del Cofre" },
            {
              key: "pro_fecha_inicio",
              label: "Inicio",
              render: (row) =>
                new Date(row.pro_fecha_inicio).toLocaleDateString(),
            },
            {
              key: "pro_fecha_fin",
              label: "Fin",
              render: (row) =>
                row.pro_fecha_fin
                  ? new Date(row.pro_fecha_fin).toLocaleDateString()
                  : "-",
            },
            {
              key: "total_acumulado",
              label: "Valor Total",
              render: (row) => `$${row.total_acumulado?.toLocaleString()}`,
            },
            {
              key: "pro_estado",
              label: "Estado",
              render: (row) => (
                <span className="badge-finalizado">
                  {row.pro_estado.toUpperCase()}
                </span>
              ),
            },
          ]}
          data={historial}
          rowKey="pro_id_proceso"
          onRowClick={(row) =>
            setProcesoDetalle({
              ...row,
              subprocesos: row.detalle_subprocesos || [],
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
              <h3>{procesoDetalle.pro_codigo_cofre}</h3>
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
                  { key: "fase", label: "Fase" },
                  { key: "trabajador", label: "Trabajador" },
                  {
                    key: "fecha_inicio",
                    label: "Inicio",
                    render: (row) =>
                      new Date(row.fecha_inicio).toLocaleString(),
                  },
                  {
                    key: "fecha_fin",
                    label: "Fin",
                    render: (row) => new Date(row.fecha_fin).toLocaleString(),
                  },
                  {
                    key: "valor",
                    label: "Valor",
                    render: (row) => `$${Number(row.valor).toLocaleString()}`,
                  },
                  {
                    key: "foto",
                    label: "Evidencia",
                    render: (row) => (
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          setImagenSeleccionada({
                            path: row.foto,
                            fase: row.fase,
                          })
                        }
                      >
                        Ver
                      </button>
                    ),
                  },
                ]}
                data={procesoDetalle.subprocesos}
                rowKey="sub_id"
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
