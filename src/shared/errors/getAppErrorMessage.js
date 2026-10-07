import { AppError } from "./AppError";

const UNEXPECTED_MESSAGE = "Ocurrió un error inesperado, intenta de nuevo";

export function getAppErrorMessage(error) {
  return error instanceof AppError ? error.message : UNEXPECTED_MESSAGE;
}
