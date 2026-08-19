import { ConflictError } from "./ConflictError";
import { NotFoundError } from "./NotFoundError";
import { ValidationError } from "./ValidationError";
import { UnexpectedError } from "./UnexpectedError";

// Códigos Postgres que se repiten en cualquier feature, sin importar la tabla
const PG_CODE_MAP = {
  23505: ConflictError, // unique_violation
  23503: ConflictError, // foreign_key_violation
  23502: ValidationError, // not_null_violation
  P0001: ValidationError, // RAISE EXCEPTION manual dentro de tus stored procedures
};

/**
 * Traduce un error de Supabase a un AppError.
 * @param {object} error - el error crudo que tira supabase-js
 * @param {object} mensajesPersonalizados - mapa opcional { codigo: mensaje } específico del feature
 */
export function mapSupabaseError(error, mensajesPersonalizados = {}) {
  const ErrorClass = PG_CODE_MAP[error.code] ?? UnexpectedError;

  const mensaje =
    mensajesPersonalizados[error.code] ??
    (ErrorClass === UnexpectedError
      ? "Ocurrió un error inesperado, intenta de nuevo"
      : error.message);

  return new ErrorClass(mensaje, { cause: error });
}
