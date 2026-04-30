import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "../../../lib/supabase";
import {
  getMatrizPrecios,
  crearTarifa,
} from "../../../features/tarifas/services/tarifaService";

vi.mock("../../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("Pruebas de Servicios y Mappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("tarifasService", () => {
    it("getMatrizPrecios debe retornar el JSON de precios para un trabajador", async () => {
      // Arrange
      const trabajadorId = 1;
      const dataMock = [{ cofre: "Cofre A", valor: 5000 }];
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: dataMock,
        error: null,
      });

      // Act
      const result = await getMatrizPrecios(trabajadorId);

      // Assert
      expect(result).to.be.an("array").and.deep.equal(dataMock);
      expect(supabase.rpc).toHaveBeenCalledWith("sp_matriz_precios_json", {
        p_trabajador_id: trabajadorId,
      });
    });

    it("crearTarifa debe ejecutar el RPC correctamente sin retornar datos", async () => {
      // Arrange
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null });

      // Act & Assert
      await expect(crearTarifa(1, 2, 15000)).resolves.not.toThrow();
      expect(supabase.rpc).toHaveBeenCalledWith("sp_crear_precio", {
        p_trabajador_cargo_id: 1,
        p_cofre_id: 2,
        p_valor: 15000,
      });
    });
  });
});
