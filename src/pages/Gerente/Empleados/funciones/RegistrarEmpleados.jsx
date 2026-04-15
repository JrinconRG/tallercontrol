import { useState } from "react";
import { useCrearEmpleado } from "../../../../hooks/useEmpleados";
import Modal from "../../../../components/modal/Modal";
import PropTypes from "prop-types";

export default function RegistrarEmpleados({ onClose, onSuccess }) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const { crearEmpleadoHook, loading } = useCrearEmpleado();

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
          <labe htmlFor="nombre-registro">Nombre</labe>
          <input
            id="nombre-registro"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <label htmlFor="apellido-registro">Apellidos</label>
          <input
            id="apellido-registro"
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
          />
          <label htmlFor="cedula-registro">Número de Documento</label>
          <input
            id="cedula-registro"
            type="text"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
          />
          <label htmlFor="celular-registro">Celular</label>
          <input
            id="celular-registro"
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
RegistrarEmpleados.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
