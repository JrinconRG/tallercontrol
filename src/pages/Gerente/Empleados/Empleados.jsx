import { useEmpleadosConCargos } from "../../../hooks/useTrabajadores";
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

const agregarCargos = (prev, seleccionados) => {
  const yaAsignadosIds = new Set(prev.cargos.map((c) => c.id));

  const nuevos = seleccionados
    .filter((nuevo) => !yaAsignadosIds.has(nuevo.c_id))
    .map((c) => ({
      id: c.c_id,
      nombre: c.c_nombre,
    }));

  return {
    ...prev,
    cargos: [...prev.cargos, ...nuevos],
  };
};

const actualizarCargos = (prev, cargoEliminado) => {
  return {
    ...prev,
    cargos: prev.cargos.filter((c) => c.id !== cargoEliminado.id),
  };
};

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
  const [empleadoDetalle, setEmpleadoDetalle] = useState(null);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cerrarDrawer();
      }
    };

    if (empleadoDetalle) {
      console.log(empleadoDetalle);

      globalThis.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, [empleadoDetalle]);
  const cerrarDrawer = () => setEmpleadoDetalle(null);

  //hook para obtener empleados activos con cargos
  const {
    empleados,
    loading: loadingEmpleados,
    refetch: refetchEmpleados,
  } = useEmpleadosConCargos();

  const loading = loadingEmpleados;

  // Función para manejar la apertura del modal de registro
  function handleRegister() {
    setShowModal(true);
  }

  // Función para manejar el cierre del modal de registro
  function handleCloseModal() {
    setShowModal(false);
  }

  // Función para manejar el éxito del registro y refrescar la lista de empleados
  function handleSuccess() {
    setShowModal(false);

    refetchEmpleados();
  }

  if (loading) return <p>Cargando empleados...</p>;

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
              onClick: handleRegister,
              variant: "secondary",
            },
          ]}
        />

        <Table
          columns={[
            {
              key: "nombre_completo",
              label: "Nombre del Trabajador",
              className: "col-main",
            },
            {
              key: "t_numero_de_documento",
              label: "Cédula",
              className: "col-sh",
            },
            {
              key: "t_celular",
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
          data={empleados}
          rowKey="t_id"
          onRowClick={(row, index) => {
            const dataFresh = empleados.find((e) => e.t_id === row.t_id);

            setEmpleadoDetalle({
              ...dataFresh,
              index,
            });
          }}
        />
      </Card>
      {empleadoDetalle && (
        <div className="drawer-overlay drawer-overlay--transparent">
          <dialog
            key={empleadoDetalle.t_id}
            className="drawer drawer--sm"
            open
            aria-modal="true"
          >
            <div className="drawer-header">
              <div className="drawer-tittle">
                <h2 className="tittle-detalle-empleado-drawer">
                  {empleadoDetalle.nombre_completo}
                </h2>
                <span className="span-tittle-empleado">
                  Cedula: {empleadoDetalle.t_numero_de_documento}
                </span>
              </div>

              <button
                className="btn btn-terciary"
                onClick={cerrarDrawer}
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
                        trabajadorId={empleadoDetalle.t_id}
                        colors={colors}
                        onSuccess={(cargoEliminado) => {
                          setEmpleadoDetalle((prev) =>
                            actualizarCargos(prev, cargoEliminado),
                          );
                          showToast({
                            message: `Fase "${cargoEliminado.nombre}" eliminada`,
                          });

                          refetchEmpleados();
                        }}
                        onError={(err, cargo) => {
                          showToast({
                            message:
                              err?.response?.data?.message ||
                              `Error eliminando ${cargo.nombre}`,
                          });
                        }}
                      />
                    );
                  })}
                </div>

                <AgregarFase
                  trabajadorId={empleadoDetalle.t_id}
                  cargosAsignados={empleadoDetalle.cargos ?? []}
                  onSuccess={({ seleccionados, trabajadorId }) => {
                    const nombre = empleados.find(
                      (e) => e.t_id === trabajadorId,
                    )?.nombre_completo;
                    for (const cargo of seleccionados) {
                      showToast({
                        message: `Fase "${cargo.c_nombre}" agregada correctamente para ${nombre} `,
                      });
                    }

                    setEmpleadoDetalle((prev) =>
                      agregarCargos(prev, seleccionados),
                    );

                    refetchEmpleados();
                  }}
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
                    <span>{empleadoDetalle.t_celular}</span>
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
        <>
          {console.log("Renderizando modal")}
          <RegistrarEmpleados
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
}
