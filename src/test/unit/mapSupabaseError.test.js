import { describe, expect, it } from "vitest";
import { AppError } from "../../shared/errors/AppError";
import { ConflictError } from "../../shared/errors/ConflictError";
import { ValidationError } from "../../shared/errors/ValidationError";
import { UnexpectedError } from "../../shared/errors/UnexpectedError";
import { getAppErrorMessage } from "../../shared/errors/getAppErrorMessage";
import { mapSupabaseError } from "../../shared/errors/mapSupabaseError";

describe("mapSupabaseError", () => {
  it("returns an AppError unchanged", () => {
    const error = new ValidationError("Dato inválido");

    expect(mapSupabaseError(error)).toBe(error);
  });

  it("only exposes messages from AppError instances to presentation", () => {
    expect(getAppErrorMessage(new ValidationError("Mensaje seguro"))).toBe(
      "Mensaje seguro",
    );
    expect(getAppErrorMessage(new Error("SQL interno"))).toBe(
      "Ocurrió un error inesperado, intenta de nuevo",
    );
  });

  it.each([
    ["23505", ConflictError],
    ["23503", ConflictError],
    ["23502", ValidationError],
    ["P0001", ValidationError],
  ])("maps PostgreSQL code %s", (code, ExpectedError) => {
    const original = { code, message: "internal database detail" };
    const mapped = mapSupabaseError(original);

    expect(mapped).toBeInstanceOf(ExpectedError);
    expect(mapped.message).not.toContain("internal database detail");
    expect(mapped.cause).toBe(original);
  });

  it("uses feature messages by code or explicitly mapped procedure message", () => {
    const customMessages = {
      23505: "Ya existe",
      "procedure detail": "Mensaje validado",
    };

    expect(mapSupabaseError({ code: "23505" }, customMessages).message).toBe(
      "Ya existe",
    );
    expect(
      mapSupabaseError(
        { code: "P0001", message: "procedure detail" },
        customMessages,
      ).message,
    ).toBe("Mensaje validado");
  });

  it("uses a feature default only for a recognized code", () => {
    const customMessages = { default: "No se pudo procesar la operación." };

    expect(mapSupabaseError({ code: "P0001" }, customMessages).message).toBe(
      customMessages.default,
    );
    expect(mapSupabaseError({ code: "unknown" }, customMessages).message).toBe(
      "Ocurrió un error inesperado, intenta de nuevo",
    );
  });

  it.each([
    null,
    undefined,
    "failure",
    {},
    { code: "unknown", message: "SQL" },
  ])("maps malformed or unknown errors safely", (original) => {
    const mapped = mapSupabaseError(original);

    expect(mapped).toBeInstanceOf(UnexpectedError);
    expect(mapped.message).toBe(
      "Ocurrió un error inesperado, intenta de nuevo",
    );
    expect(mapped.cause).toBe(original);
  });
});
