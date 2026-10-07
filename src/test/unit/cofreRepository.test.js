import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../shared/errors/ConflictError";

vi.mock("../../features/cofres/service/cofresService", () => ({
  obtenerReferenciasCofre: vi.fn(),
  eliminarReferenciaCofre: vi.fn(),
  crearReferenciaCofre: vi.fn(),
}));

import { obtenerReferenciasCofre } from "../../features/cofres/service/cofresService";
import { CofreRepository } from "../../features/cofres/infrastructure/cofreRepository";

describe("CofreRepository error boundary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps read errors and preserves their cause", async () => {
    const originalError = {
      code: "23505",
      message: "internal constraint detail",
    };
    obtenerReferenciasCofre.mockRejectedValue(originalError);

    await expect(CofreRepository.getReferencias()).rejects.toMatchObject({
      name: "ConflictError",
      message: "Ya existe una referencia activa con ese código",
      cause: originalError,
    });
  });
});
