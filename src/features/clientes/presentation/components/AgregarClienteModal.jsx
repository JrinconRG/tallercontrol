import { useState } from "react";
import Modal from "../../../../components/modal/Modal";
import { useCrearCliente } from "../../application/hooks/useCrearCliente";

export default function AgregarClienteModal({ isOpen, onClose, onToast }) {
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fieldError, setFieldError] = useState("");

  const { mutate: crearCliente, isPending } = useCrearCliente();

  const resetForm = () => {
    setNombre("");
    setCelular("");
    setDireccion("");
    setFieldError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = () => {
    setFieldError("");

    crearCliente(
      {
        nombre: nombre.trim(),
        celular: celular.trim() || null,
        direccion: direccion.trim() || null,
      },
      {
        onSuccess: () => {
          onToast?.("Cliente creado", "success");
          resetForm();
          onClose();
        },
        onError: (error) => {
          setFieldError(error.message);
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Agregar cliente"
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmText="Crear cliente"
      cancelText="Cancelar"
      loading={isPending}
    >
      <div className="form-group">
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="celular">Celular</label>
        <input
          id="celular"
          type="text"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="direccion">Dirección</label>
        <textarea
          id="direccion"
          rows={3}
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </div>

      {fieldError && <p className="form-error">{fieldError}</p>}
    </Modal>
  );
}
