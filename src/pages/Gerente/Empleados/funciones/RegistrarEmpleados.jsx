import { useState, useEffect } from "react";
import { useCrearEmpleado } from "../../../../hooks/useEmpleados";
import Modal from "../../../../components/modal/Modal";

export default function RegistrarEmpleados({ onClose, onSuccess }) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const { crearEmpleadoHook, loading, error } = useCrearEmpleado();

  const [errorMsg, setErrorMsg] = useState("");

  const handleConfirmar = async () => {
    setErrorMsg("");
    if (!nombre || !apellidos || !numeroDocumento || !celular) {
      setErrorMsg("Por favor, complete todos los campos.");
      return;
    }
    try {
      await crearEmpleadoHook(nombre, apellidos, numeroDocumento, celular);

      onSuccess();
      onClose();
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || error.message || "Error inesperado",
      );
    }
  };

  return (
    <Modal
      isOpen
      title="Registrar Empleado"
      confirmText="Registrar"
      onConfirm={handleConfirmar}
      onClose={onClose}
    >
      {loading ? (
        <p>Registrando empleado...</p>
      ) : (
        <>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <label>Apellidos</label>
          <input
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
          />
          <label>Número de Documento</label>
          <input
            type="text"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
          />
          <label>Celular</label>
          <input
            type="text"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
          />
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        </>
      )}
    </Modal>
  );
}
