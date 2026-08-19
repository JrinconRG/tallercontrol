import { useState } from "react";
import Modal from "../../../../../components/modal/Modal";
import { useCrearReferenciaCofre } from "../../../application/hook/useCrearReferenciaCofre";

export default function AgregarReferenciaCofre({ isOpen, onClose, onToast }) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fieldError, setFieldError] = useState("");

  const { mutate: crearReferencia, isPending } = useCrearReferenciaCofre();

  const resetForm = () => {
    setCodigo("");
    setNombre("");
    setDescripcion("");
    setFieldError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = (e) => {
    setFieldError("");

    e.preventDefault();
    if (!codigo || !nombre || !descripcion) {
      setFieldError("Todos los campos son obligatorios");
      return;
    }

    crearReferencia(
      {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
      },
      {
        onSuccess: () => {
          resetForm();
          onToast("Referencia creada exitosamente");
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
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Agregar Referencia"
      confirmText="Crear referencia"
      cancelText="Cancelar"
      loading={isPending}
    >
      <div className="form-group">
        <label htmlFor="codigo">Código:</label>
        <input
          id="codigo"
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="nombre">Nombre:</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      {fieldError && <p className="form-error">{fieldError}</p>}
    </Modal>
  );
}
