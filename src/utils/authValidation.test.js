import { describe, expect, it } from "vitest";
import {
  validateEmployeeFields,
  validateLoginCredentials,
} from "./authValidation";

describe("validateEmployeeFields", () => {
  const validFields = {
    nombre: "Ana",
    apellidos: "Pérez",
    numeroDocumento: "12345678",
    celular: "3001234567",
  };

  it("accepts valid employee fields", () => {
    expect(validateEmployeeFields(validFields)).toEqual({ isValid: true });
  });

  it("returns an error when a required field is missing", () => {
    expect(
      validateEmployeeFields({ ...validFields, celular: "" }),
    ).toEqual({
      isValid: false,
      error: "Por favor, complete todos los campos.",
    });
  });

  it("rejects surnames shorter than five letters", () => {
    expect(
      validateEmployeeFields({ ...validFields, apellidos: "Luz" }),
    ).toEqual({
      isValid: false,
      error:
        "Los apellidos deben tener mínimo 5 letras y sin caracteres extraños.",
    });
  });

  it("rejects non-digit cellphone values", () => {
    expect(
      validateEmployeeFields({ ...validFields, celular: "3001234/67" }),
    ).toEqual({
      isValid: false,
      error: "El celular debe tener exactamente 10 dígitos.",
    });
  });
});

describe("validateLoginCredentials", () => {
  it("continues to validate login credentials", () => {
    expect(validateLoginCredentials(" juana ", "1234")).toEqual({
      isValid: true,
      cleanIdentifier: "juana",
      password: "1234",
    });
  });
});
