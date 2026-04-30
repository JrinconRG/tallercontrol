import { useState } from "react";
import { useCrearTrabajador } from "../../../../features/Trabajadores/application/hooks/useCrearEmpleado";

import Modal from "../../../../components/modal/Modal";
import PropTypes from "prop-types";

export default function RegistrarEmpleados({ onClose, onToast }) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const validarCampos = () => {
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{5,}$/;

    const numeroRegex = /^[\d\/]+$/;

    const celularRegex = /^[\d\/]{10}$/;
    if (!nombreRegex.test(nombre)) {
      return "El nombre debe tener mínimo 5 letras y sin caracteres extraños.";
    }

    if (!nombreRegex.test(apellidos)) {
      return "Los apellidos deben tener mínimo 5 letras y sin caracteres extraños.";
    }

    if (!numeroRegex.test(numeroDocumento)) {
      return "El documento debe contener solo números positivos.";
    }

    if (!celularRegex.test(celular)) {
      return "El celular debe tener exactamente 10 dígitos.";
    }

    return null;
  };

  const createEmpleadoMutation = useCrearTrabajador();

  const handleConfirmar = async () => {
    setErrorMsg("");

    if (!nombre || !apellidos || !numeroDocumento || !celular) {
      setErrorMsg("Por favor, complete todos los campos.");
      return;
    }

    const error = validarCampos();
    if (error) {
      setErrorMsg(error);
      return;
    }

    createEmpleadoMutation.mutate(
      {
        nombre,
        apellidos,
        numeroDocumento,
        celular,
      },
      {
        onSuccess: () => {
          onToast?.({ message: `Empleado ${nombre} registrado exitosamente` });
          onClose();
        },
        onError: (error) =>
          setErrorMsg(
            error.response?.data?.message ||
              error.message ||
              "Error inesperado",
          ),
      },
    );
  };

  return (
    <Modal
      isOpen
      title="Registrar Empleado"
      confirmText={
        createEmpleadoMutation.isPending ? "Registrando..." : "Registrar"
      }
      onConfirm={handleConfirmar}
      onClose={onClose}
      disabled={createEmpleadoMutation.isPending}
    >
      {createEmpleadoMutation.isPending ? (
        <p>Registrando empleado...</p>
      ) : (
        <>
          <label htmlFor="nombre-registro">Nombre</label>
          <input
            id="nombre-registro"
            type="text"
            value={nombre}
            onChange={(e) =>
              setNombre(
                e.target.value.replaceAll(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, ""),
              )
            }
          />
          <label htmlFor="apellido-registro">Apellidos</label>
          <input
            id="apellido-registro"
            type="text"
            value={apellidos}
            onChange={(e) =>
              setApellidos(
                e.target.value.replaceAll(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, ""),
              )
            }
          />
          <label htmlFor="cedula-registro">Número de Documento</label>
          <input
            id="cedula-registro"
            type="text"
            value={numeroDocumento}
            onChange={(e) =>
              setNumeroDocumento(e.target.value.replaceAll(/\D/g, ""))
            }
          />
          <label htmlFor="celular-registro">Celular</label>
          <input
            maxLength={10}
            id="celular-registro"
            type="text"
            value={celular}
            onChange={(e) => setCelular(e.target.value.replaceAll(/\D/g, ""))}
          />
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        </>
      )}
    </Modal>
  );
}
RegistrarEmpleados.propTypes = {
  onClose: PropTypes.func.isRequired,
  onToast: PropTypes.func,
};
