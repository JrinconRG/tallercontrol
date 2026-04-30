import { describe, it, expect, vi } from "vitest";
import { supabase } from "../../../lib/supabase";
import { cargoMapper } from "../../../features/cargos/domain/mappers/cargoMapper";
import { obtenerCargos } from "../../../features/cargos/service/cargosService";

vi.mock("../../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("cargoService & Mapper", () => {
  it("obtenerCargos debe retornar la lista de la vista de cargos activos", async () => {
    // Arrange
    const cargosRaw = [{ c_id: 1, c_nombre: "Soldador" }];
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: cargosRaw, error: null }),
    });

    // Act
    const result = await obtenerCargos();

    // Assert
    expect(result).to.be.an("array").and.have.lengthOf(1);
    expect(supabase.from).toHaveBeenCalledWith("vw_cargos_activos");
  });

  it("cargoMapper debe mapear correctamente los campos cortos", () => {
    // Arrange
    const raw = { c_id: 10, c_nombre: "Administrador" };

    // Act
    const result = cargoMapper(raw);

    // Assert
    expect(result).to.have.property("id").equal(10);
    expect(result).to.have.property("nombre").equal("Administrador");
  });

  it("Debe lanzar error si la base de datos falla al obtener cargos", async () => {
    // Arrange
    const errorMock = { message: "Error de permisos" };
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: errorMock }),
    });

    // Act & Assert
    await expect(obtenerCargos()).rejects.toThrow("Error de permisos");
  });
});
