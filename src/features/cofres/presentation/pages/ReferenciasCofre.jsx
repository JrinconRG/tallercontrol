import Table from "../../../../components/Table/Table";
import Card from "../../../../components/card/Card";
import Toast from "../../../../components/Toast/Toast";
import ActionCell from "../../../../components/DeleteConfirmPopover/ActionCell";
import { useState } from "react";
import { useToast } from "../../../../hooks/useToast";
import { useObtenerReferenciasCofres } from "../../application/hook/useObtenerReferenciasCofres";
import { useEliminarReferenciaCofres } from "../../application/hook/useEliminarReferenciaCofres";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";
import AgregarReferenciaCofre from "./components/AgregarReferenciaCofre";
import "./ReferenciasCofre.css";

export default function ReferenciasCofre() {
  const [showModal, setShowModal] = useState(false);
  const [referenciaAEliminar, setReferenciaAEliminar] = useState(null);
  const { toasts, showToast } = useToast();

  const {
    referencias = [],
    loading,
    error,
    errorMessage,
  } = useObtenerReferenciasCofres();

  const { mutate: eliminarReferencia, isPending: isDeleting } =
    useEliminarReferenciaCofres();

  const referenciasActivas = referencias.filter((r) => r.activo);

  const handleConfirmarEliminar = () => {
    if (!referenciaAEliminar) return;

    eliminarReferencia(referenciaAEliminar.id, {
      onSuccess: () => {
        showToast("Referencia eliminada", "success");
        setReferenciaAEliminar(null);
      },
      onError: (err) => {
        showToast(getAppErrorMessage(err), "error");
        setReferenciaAEliminar(null);
      },
    });
  };

  const columns = [
    {
      key: "codigo",
      label: "Código",
      className: "col-sh",
      render: (row) => (
        <ActionCell
          row={row}
          displayField="codigo"
          itemAEliminar={referenciaAEliminar}
          setItemAEliminar={setReferenciaAEliminar}
          isDeleting={isDeleting}
          handleConfirmarEliminar={handleConfirmarEliminar}
        />
      ),
    },
    {
      key: "nombre",
      label: "Nombre",
      className: "col-sh",
    },
    { key: "descripcion", label: "Descripción", className: "col-main" },
  ];

  if (loading) return <p>Cargando referencias...</p>;
  if (error) return <p>Error cargando referencias: {errorMessage}</p>;

  return (
    <div className="page-conten-referencias">
      <Toast toasts={toasts} />

      <div className="header-page">
        <h1 className="page-tittle">Referencias de Cofres</h1>
        <p className="page-mini-info">
          Gestión de referencias de cofres, incluyendo creación y eliminación de
          referencias.
        </p>
      </div>
      <div className="body-page-referencias">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Agregar referencia
        </button>

        <Card>
          <Table columns={columns} data={referenciasActivas} rowKey="id" />
        </Card>

        <AgregarReferenciaCofre
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onToast={showToast}
        />
      </div>
    </div>
  );
}
