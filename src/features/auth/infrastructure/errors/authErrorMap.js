// features/auth/infrastructure/errors/authErrorMap.js
export const authErrorMap = {
  invalid_credentials: "Usuario o contraseña incorrectos",
  user_not_found: "Usuario o contraseña incorrectos",
  email_not_confirmed: "Debes confirmar tu correo antes de ingresar",
  user_banned: "Tu cuenta está bloqueada. Contacta al administrador",
  over_request_rate_limit:
    "Demasiados intentos. Espera unos minutos e intenta de nuevo",
};
