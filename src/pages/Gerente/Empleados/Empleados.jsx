import { useInformacionEmpleados } from "../../../features/Trabajadores/application/hooks/useInformacionEmpleados";
import Card from "../../../components/card/Card";
import Table from "../../../components/Table/Table";
import TableHeader from "../../../components/Table/TableHeader";
import "./Empleados.css";
import { useState, useEffect } from "react";
import RegistrarEmpleados from "./funciones/RegistrarEmpleados";
import AgregarFase from "./funciones/AgregarFase";
import EliminarFase from "./funciones/EliminarFase";
import { useToast } from "../../../hooks/useToast";
import Toast from "../../../components/Toast/Toast";

const stringToPastelColor = (str) => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.codePointAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;

  return {
    bg: `hsl(${hue}, 70%, 85%)`,
    border: `hsl(${hue}, 60%, 65%)`,
    text: `hsl(${hue}, 40%, 25%)`,
  };
};

export default function Empleados() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [empleadoDetalleId, setEmpleadoDetalleId] = useState(null);
  const { toasts, showToast } = useToast();

  const { empleados, loading, error } = useInformacionEmpleados();
  console.log("Empleados obtenidos:", empleados);

  useEffect(() => {
    if (!empleadoDetalleId) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setEmpleadoDetalleId(null);
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [empleadoDetalleId]);

  if (loading) return <p>Cargando empleados...</p>;
  if (error) return <p>Error cargando empleados</p>;

  const empleadoDetalle =
    empleados.find((e) => e.id === empleadoDetalleId) ?? null;

  const empleadosFiltrados = empleados.filter((e) => {
    return e.nombre?.toLowerCase().includes(search.toLowerCase());
  });

  // Función para manejar el cierre del modal de registro

  return (
    <div className="page-content-Empleados">
      <Toast toasts={toasts} />
      <div className="header-page">
        <h1 className="page-tittle">Empleados</h1>
        <p className="page-mini-info">Agregar y visualizar empleados</p>
      </div>
      <Card className="card-empleados" style={{ backgroundColor: "#ffffff" }}>
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
          actions={[
            {
              label: "+ Registrar empleado",
              onClick: () => setShowModal(true),
              variant: "secondary",
            },
          ]}
        />

        <Table
          columns={[
            {
              key: "nombre",
              label: "Nombre del Trabajador",
              className: "col-main",
            },
            {
              key: "documento",
              label: "Cédula",
              className: "col-sh",
            },
            {
              key: "celular",
              label: "Celular",
              className: "col-sh",
            },
            {
              key: "cargos",
              label: "Fases asignadas",
              className: "col-main",
              render: (row) => (
                <div className="cargos-container">
                  {row.cargos?.map((cargo) => {
                    const colors = stringToPastelColor(cargo.nombre);

                    return (
                      <span
                        key={cargo.id}
                        className="cargo-chip"
                        style={{
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          color: colors.text,
                        }}
                      >
                        {cargo.nombre}
                      </span>
                    );
                  })}
                </div>
              ),
            },
          ]}
          data={empleadosFiltrados}
          rowKey="id"
          onRowClick={(row) => setEmpleadoDetalleId(row.id)}
        />
      </Card>
      {empleadoDetalle && (
        <div className="drawer-overlay drawer-overlay--transparent">
          <dialog
            key={empleadoDetalle.id}
            className="drawer drawer--sm"
            open
            aria-modal="true"
          >
            <div className="drawer-header">
              <div className="drawer-tittle">
                <h2 className="tittle-detalle-empleado-drawer">
                  {empleadoDetalle.nombre}
                </h2>
                <span className="span-tittle-empleado">
                  Cedula: {empleadoDetalle.documento}
                </span>
              </div>

              <button
                className="btn btn-terciary"
                onClick={() => setEmpleadoDetalleId(null)}
                aria-label="Cerrar detalle"
              >
                X
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-body-detalle-empleados">
                <h3
                  style={{
                    color: "var(--neutral-600)",
                    fontSize: "22px",
                    fontWeight: "600",
                  }}
                >
                  FASES ASIGNADAS
                </h3>

                <div className="cargos-container">
                  {empleadoDetalle.cargos?.map((cargo) => {
                    const colors = stringToPastelColor(cargo.nombre);
                    return (
                      <EliminarFase
                        key={cargo.id}
                        cargo={cargo}
                        trabajadorId={empleadoDetalle.id}
                        colors={colors}
                        onToast={showToast}
                      />
                    );
                  })}
                </div>

                <AgregarFase
                  trabajadorId={empleadoDetalle.id}
                  cargosAsignados={empleadoDetalle.cargos ?? []}
                  onToast={showToast}
                />

                <hr />
                <div className="drawer-tittle">
                  <h3
                    style={{
                      color: "var(--neutral-600)",
                      fontSize: "22px",
                      fontWeight: "600",
                    }}
                  >
                    INFORMACION
                  </h3>
                  <div className="info-grid">
                    <span>Celular:</span>
                    <span>{empleadoDetalle.celular}</span>
                    <span>Fases Activas:</span>
                    <span>{empleadoDetalle.cargos.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </dialog>
        </div>
      )}

      {showModal && (
        <RegistrarEmpleados
          onToast={showToast}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
