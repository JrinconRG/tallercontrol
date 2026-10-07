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
