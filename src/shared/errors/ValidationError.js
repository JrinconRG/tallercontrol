import { AppError } from "./AppError";

// Para datos de entrada inválidos (los que detecta tu propio RAISE EXCEPTION en el SP)
export class ValidationError extends AppError {}
