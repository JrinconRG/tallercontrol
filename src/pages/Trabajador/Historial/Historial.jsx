import { useState } from "react";
import { useHistorialSubprocesosTrabajadorNoPagado } from "../../../hooks/useSubprocesos";
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
  const { historialSubProcesos, loading, error } =
    useHistorialSubprocesosTrabajadorNoPagado();
  if (loading) return <p>Cargando historial..</p>;
  if (error) return <p>Error al cargar historial..</p>;
  console.log(historialSubProcesos);

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
          data={historialSubProcesos}
          rowKey="sub_id_subproceso"
          columns={[
            {
              key: "pro_codigo_cofre",
              label: "Código",
            },
            {
              key: "referencia_nombre",
              label: "Nombre del Cofre",
            },
            {
              key: "duracion_reloj",
              label: "Duracion",
            },
            {
              key: "sub_fecha_inicio",
              label: "Inicio",
              render: (row) =>
                new Date(row.sub_fecha_inicio).toLocaleDateString(),
            },
            {
              key: "sub_fecha_fin",
              label: "Fin",
              render: (row) =>
                row.sub_fecha_fin
                  ? new Date(row.sub_fecha_fin).toLocaleDateString()
                  : "-",
            },
            {
              key: "trabajador_nombre",
              label: "Nombre ",
            },
            {
              key: "cargo_nombre",
              label: "Trabajo realizado ",
            },
            {
              key: "valor_pagar",
              label: "Valor Total",
              render: (row) => `$${row.valor_pagar?.toLocaleString()}`,
            },

            {
              key: "sub_fotos_evidencia",
              label: "Evidencia",
              render: (row) => {
                // Verificar si hay fotos
                const tieneFotos =
                  row.sub_fotos_evidencia && row.sub_fotos_evidencia.length > 0;
                return tieneFotos ? (
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      setImagenSeleccionada({
                        path: row.sub_fotos_evidencia,
                        fase: row.cargo_nombre,
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
