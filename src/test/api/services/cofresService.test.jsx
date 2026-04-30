import { describe, it, expect, vi } from "vitest";
import { supabase } from "../../../lib/supabase";
import { obtenerReferenciasCofre } from "../../../features/cofres/service/cofresService";
import { referenciaMapper } from "../../../features/cofres/domain/mappers/referenciaMapper";

vi.mock("../../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("cofreService & Mapper", () => {
  it("obtenerReferenciasCofre debe aplicar el ordenamiento por nombre", async () => {
    // Arrange
    const rawMock = [
      {
        rc_id: 1,
        rc_nombre: "Cofre Alpha",
        rc_codigo: "A1",
        rc_descripcion: "Desc",
      },
    ];
    const orderMock = vi.fn().mockResolvedValue({ data: rawMock, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    vi.mocked(supabase.from).mockReturnValue({ select: selectMock });

    // Act
    const result = await obtenerReferenciasCofre();

    // Assert
    expect(result).to.deep.equal(rawMock);
    expect(orderMock).toHaveBeenCalledWith("rc_nombre");
  });

  it("referenciaMapper debe transformar correctamente el objeto raw a la Entidad", () => {
    // Arrange
    const raw = {
      rc_id: 5,
      rc_codigo: "C-05",
      rc_nombre: "Cofre Lujo",
      rc_descripcion: "Madera",
    };

    // Act
    const entidad = referenciaMapper(raw);

    // Assert
    expect(entidad.id).to.equal(raw.rc_id);
    expect(entidad.nombre).to.equal(raw.rc_nombre);
    expect(entidad.codigo).to.equal(raw.rc_codigo);
  });
});
