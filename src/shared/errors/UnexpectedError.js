import { AppError } from "./AppError";

// Catch-all: algo que no anticipaste. Nunca debería mostrarse tal cual al usuario.
export class UnexpectedError extends AppError {}
