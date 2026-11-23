import { useInformacionEmpleados } from "../../application/hooks/useInformacionEmpleados";
import Card from "../../../../components/card/Card";
import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import "./Empleados.css";
import { useState, useEffect, useMemo } from "react";
import RegistrarEmpleados from "../components/RegistrarEmpleados";
import AgregarFase from "../components/AgregarFase";
import EliminarFase from "../components/EliminarFase";
import ActionCell from "../../../../components/DeleteConfirmPopover/ActionCell";
import { useEliminarTrabajador } from "../../application/hooks/useEliminarTrabajador";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";

import Pagination from "../../../../components/pagination/Pagination";
import { usePagination } from "../../../../hooks/usePagination";

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
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const { showSuccess, showError } = useToast();
  const { empleados, loading, error } = useInformacionEmpleados();
  const { mutate: eliminarEmpleado, isPending: isDeleting } =
    useEliminarTrabajador();

  const handleConfirmarEliminar = () => {
    if (!empleadoAEliminar) return;

    eliminarEmpleado(empleadoAEliminar.id, {
      onSuccess: () => {
        showSuccess(
          "Empleado dado de baja",
          "Su historial y nóminas anteriores se conservan.",
        );
        setEmpleadoAEliminar(null);
      },
      onError: (err) => {
        showError(
          "No se pudo dar de baja al empleado",
          getAppErrorMessage(err),
        );
        setEmpleadoAEliminar(null);
      },
    });
  };

  useEffect(() => {
    if (!empleadoDetalleId) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setEmpleadoDetalleId(null);
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [empleadoDetalleId]);

  const empleadosFiltrados = useMemo(() => {
    return empleados.filter((e) => {
      const matchSearch = e.nombre
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchEstado = estado
        ? e.cargos?.some((c) => c.nombre?.trim() === estado.trim())
        : true;

      return matchSearch && matchEstado;
    });
  }, [empleados, search, estado]);

  const opcionesFase = useMemo(() => {
    const fases = empleados.map((e) => e.cargos?.map((c) => c.nombre?.trim()));
    const unicas = [...new Set(fases.flat())].filter(Boolean);
    return [
      { value: "", label: "Todas las fases" },
      ...unicas.map((fase) => ({ value: fase, label: fase })),
    ];
  }, [empleados]);

  const {
    page,
    limit,
    paginatedData: datosPaginados,
    setPage,
    setLimit,
    resetPage,
  } = usePagination(empleadosFiltrados, 10);

  if (loading) return <p>Cargando empleados...</p>;
  if (error) return <p>Error cargando empleados</p>;

  const empleadoDetalle =
    empleados.find((e) => e.id === empleadoDetalleId) ?? null;

  return (
    <div className="page-content-Empleados">
      <div className="header-page">
        <h1 className="page-tittle">Empleados</h1>
        <p className="page-mini-info">Agregar y visualizar empleados</p>
      </div>
      <Card className="card-empleados" style={{ backgroundColor: "#ffffff" }}>
        <TableHeader
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            resetPage();
          }}
          filters={[
            {
              name: "estado",
              value: estado,
              onChange: (value) => {
                setEstado(value);
                resetPage();
              },
              options: opcionesFase,
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
              render: (row) => (
                <ActionCell
                  row={row}
                  displayField="nombre"
                  itemAEliminar={empleadoAEliminar}
                  setItemAEliminar={setEmpleadoAEliminar}
                  isDeleting={isDeleting}
                  handleConfirmarEliminar={handleConfirmarEliminar}
                />
              ),
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
          data={datosPaginados}
          rowKey="id"
          onRowClick={(row) => setEmpleadoDetalleId(row.id)}
          selectedId={empleadoDetalleId}
        />

        <Pagination
          totalItems={empleadosFiltrados.length}
          limit={limit}
          page={page}
          onPageChange={setPage}
          onLimitChange={setLimit}
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
                    fontSize: "var(--font-title)",
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
                      />
                    );
                  })}
                </div>

                <AgregarFase
                  trabajadorId={empleadoDetalle.id}
                  cargosAsignados={empleadoDetalle.cargos ?? []}
                />

                <hr />
                <div className="drawer-tittle">
                  <h3
                    style={{
                      color: "var(--neutral-600)",
                      fontSize: "var(--font-title)",
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

      {showModal && <RegistrarEmpleados onClose={() => setShowModal(false)} />}
    </div>
  );
}
