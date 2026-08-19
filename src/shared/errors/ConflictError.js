import { AppError } from "./AppError";

// Para violaciones de unicidad, datos duplicados, estados incompatibles
export class ConflictError extends AppError {}
