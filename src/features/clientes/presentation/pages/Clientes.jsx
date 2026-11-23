import Table from "../../../../components/Table/Table";
import Card from "../../../../components/card/Card";
import ActionCell from "../../../../components/DeleteConfirmPopover/ActionCell";
import { useState } from "react";
import { useToast } from "../../../../hooks/useToast";
import { useObtenerClientes } from "../../application/hooks/useObtenerClientes";
import { useEliminarCliente } from "../../application/hooks/useEliminarCliente";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";
import AgregarClienteModal from "../components/AgregarClienteModal";
import "./Clientes.css";

export default function Clientes() {
  const [showModal, setShowModal] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const { showSuccess, showError } = useToast();

  const { clientes = [], loading, error, errorMessage } = useObtenerClientes();

  const { mutate: eliminarCliente, isPending: isDeleting } =
    useEliminarCliente();

  const clientesActivos = clientes.filter((c) => c.activo);

  const handleConfirmarEliminar = () => {
    if (!clienteAEliminar) return;

    eliminarCliente(clienteAEliminar.id, {
      onSuccess: () => {
        showSuccess("Cliente eliminado", "El cliente se eliminó correctamente.");
        setClienteAEliminar(null);
      },
      onError: (err) => {
        showError("No se pudo eliminar el cliente", getAppErrorMessage(err));
        setClienteAEliminar(null);
      },
    });
  };

  const columns = [
    {
      key: "nombre",
      label: "Nombre",
      className: "col-sh",
      render: (row) => (
        <ActionCell
          row={row}
          displayField="nombre"
          itemAEliminar={clienteAEliminar}
          setItemAEliminar={setClienteAEliminar}
          isDeleting={isDeleting}
          handleConfirmarEliminar={handleConfirmarEliminar}
        />
      ),
    },

    {
      key: "celular",
      label: "Celular",
      className: "col-sh",
      render: (row) => row.getCelularMostrar(),
    },
    {
      key: "direccion",
      label: "Dirección",
      className: "col-main",
      render: (row) => row.getDireccionMostrar(),
    },
  ];

  if (loading) return <p>Cargando clientes...</p>;
  if (error) return <p>Error cargando clientes: {errorMessage}</p>;

  return (
    <div className="page-conten-clientes">
      <div className="header-page">
        <h1 className="page-tittle">Clientes</h1>
        <p className="page-mini-info">
          Gestión de clientes, incluyendo creación y eliminación de clientes.
        </p>
      </div>
      <div className="body-page-clientes">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Agregar cliente
        </button>

        <Card>
          <Table columns={columns} data={clientesActivos} rowKey="id" />
        </Card>

        <AgregarClienteModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onToast={showSuccess}
        />
      </div>
    </div>
  );
}
