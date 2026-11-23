/**
 */
export const validateLoginCredentials = (identifier, password) => {
  const cleanIdentifier = identifier ? identifier.trim() : "";

  if (!cleanIdentifier) {
    return { isValid: false, error: "Por favor, ingrese su usuario o correo." };
  }

  if (!password) {
    return { isValid: false, error: "Por favor, ingrese su contraseña." };
  }

  if (cleanIdentifier.length < 3) {
    return { isValid: false, error: "El usuario o correo es demasiado corto." };
  }

  if (password.length < 4) {
    return { isValid: false, error: "La contraseña ingresada no es válida." };
  }

  // Validación si el identificador ingresado corresponde a una sintaxis de email
  if (cleanIdentifier.includes("@")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanIdentifier)) {
      return {
        isValid: false,
        error: "El formato del correo electrónico es inválido.",
      };
    }
  }

  return { isValid: true, cleanIdentifier, password };
};

export const validateEmployeeFields = ({
  nombre,
  apellidos,
  numeroDocumento,
  celular,
}) => {
  if (!nombre || !apellidos || !numeroDocumento || !celular) {
    return { isValid: false, error: "Por favor, complete todos los campos." };
  }

  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/;
  const apellidosRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{5,}$/;
  const numeroRegex = /^\d+$/;
  const celularRegex = /^\d{10}$/;

  if (!nombreRegex.test(nombre)) {
    return {
      isValid: false,
      error: "El nombre debe tener mínimo 3 letras y sin caracteres extraños.",
    };
  }

  if (!apellidosRegex.test(apellidos)) {
    return {
      isValid: false,
      error: "Los apellidos deben tener mínimo 5 letras y sin caracteres extraños.",
    };
  }

  if (!numeroRegex.test(numeroDocumento)) {
    return {
      isValid: false,
      error: "El documento debe contener solo números positivos.",
    };
  }

  if (!celularRegex.test(celular)) {
    return {
      isValid: false,
      error: "El celular debe tener exactamente 10 dígitos.",
    };
  }

  return { isValid: true };
};
