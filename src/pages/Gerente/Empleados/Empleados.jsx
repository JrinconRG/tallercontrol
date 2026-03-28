import { useEmpleadosConCargos } from "../../../hooks/useTrabajadores";
import Card from "../../../components/card/Card";
import Table from "../../../components/Table/Table";
import TableHeader from "../../../components/Table/TableHeader";
import "./Empleados.css";
import { useState } from "react";
import RegistrarEmpleados from "./funciones/RegistrarEmpleados";

export default function Empleados() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [showModal, setShowModal] = useState(false);

  //hook para obtener empleados activos con cargos
  const {
    empleados,
    loading: loadingEmpleados,
    refetch: refetchEmpleados,
  } = useEmpleadosConCargos();
  console.log("Empleados obtenidos:", empleados); // Agrega este console.log para verificar los datos obtenidos

  const loading = loadingEmpleados;

  // Función para manejar la apertura del modal de registro
  function handleRegister() {
    console.log("Botón clickeado"); // <-- Agrega esto
    console.log("showModal antes:", showModal); // <-- Y esto
    setShowModal(true);
    console.log("showModal después:", showModal); // <-- Y esto
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
      <div className="page-header-empleados">
        <h1>Empleados</h1>
        <p>Agregar y visualizar empleados</p>
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
                  {row.cargos?.map((cargo, idx) => (
                    <span key={idx} className="cargo-chip">
                      {cargo.nombre}
                    </span>
                  ))}
                </div>
              ),
            },
          ]}
          data={empleados}
          onRowClick={(row) => console.log("Editar empleado", row.t_id)}
        />
      </Card>

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
