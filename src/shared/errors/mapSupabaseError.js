import { AppError } from "./AppError";
import { ConflictError } from "./ConflictError";
import { NotFoundError } from "./NotFoundError";
import { ValidationError } from "./ValidationError";
import { UnexpectedError } from "./UnexpectedError";

const PG_CODE_MAP = {
  23505: ConflictError,
  23503: ConflictError,
  23502: ValidationError,
  P0001: ValidationError,
};

const SAFE_MESSAGES = new Map([
  [
    ConflictError,
    "No se pudo completar la operación por un conflicto con los datos.",
  ],
  [NotFoundError, "No se encontró el registro solicitado."],
  [
    ValidationError,
    "Los datos ingresados no son válidos. Revisa la información e intenta de nuevo.",
  ],
  [UnexpectedError, "Ocurrió un error inesperado, intenta de nuevo"],
]);

function readProperty(value, property) {
  try {
    return value?.[property];
  } catch {
    return undefined;
  }
}

function getCustomMessage(messages, code, originalMessage) {
  if (!messages || typeof messages !== "object") return undefined;

  const keys = [code, originalMessage];
  for (const key of keys) {
    if (typeof key !== "string" && typeof key !== "number") continue;
    if (!Object.hasOwn(messages, key)) continue;

    const value = readProperty(messages, key);
    if (typeof value === "string") return value;
  }

  return undefined;
}

function getDefaultCustomMessage(messages) {
  if (!messages || typeof messages !== "object") return undefined;
  if (!Object.hasOwn(messages, "default")) {
    return undefined;
  }

  const value = readProperty(messages, "default");
  return typeof value === "string" ? value : undefined;
}

export function mapSupabaseError(error, mensajesPersonalizados = {}) {
  if (error instanceof AppError) return error;

  const rawCode = readProperty(error, "code");
  const code =
    typeof rawCode === "string" || typeof rawCode === "number"
      ? String(rawCode)
      : undefined;
  const originalMessage = readProperty(error, "message");
  const ErrorClass =
    code && Object.hasOwn(PG_CODE_MAP, code)
      ? PG_CODE_MAP[code]
      : UnexpectedError;
  const message =
    getCustomMessage(mensajesPersonalizados, code, originalMessage) ??
    (ErrorClass !== UnexpectedError
      ? getDefaultCustomMessage(mensajesPersonalizados)
      : undefined) ??
    SAFE_MESSAGES.get(ErrorClass);

  return new ErrorClass(message, { cause: error });
}
