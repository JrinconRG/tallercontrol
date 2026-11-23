import { useState } from "react";
import { useCrearTrabajador } from "../../application/hooks/useCrearEmpleado";

import Modal from "../../../../components/modal/Modal";
import PropTypes from "prop-types";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";
import { validateEmployeeFields } from "../../../../utils/authValidation";

export default function RegistrarEmpleados({ onClose }) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { showSuccess } = useToast();

  const createEmpleadoMutation = useCrearTrabajador();

  const handleConfirmar = async () => {
    setErrorMsg("");

    const validation = validateEmployeeFields({
      nombre,
      apellidos,
      numeroDocumento,
      celular,
    });
    if (!validation.isValid) {
      setErrorMsg(validation.error);
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
        onSuccess: (resultado) => {
          if (resultado.reincorporado) {
            showSuccess(
              "Trabajador reincorporado",
              `${resultado.nombreCompleto} ya estaba registrado y fue reincorporado. Recuerda asignarle sus cargos.`,
            );
          } else {
            showSuccess(
              "Empleado registrado",
              `${nombre} ${apellidos} se registró correctamente.`,
            );
          }
          onClose();
        },
        // Los errores se muestran dentro del formulario, junto a los campos
        onError: (error) => setErrorMsg(getAppErrorMessage(error)),
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
      disableConfirm={createEmpleadoMutation.isPending}
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
};
