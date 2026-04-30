import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  obtenerProcesosActivos,
  obtenerHistorialProcesos,
  crearProceso,
  obtenerFaseActualProcesos,
  validarSiguienteFase,
  obtenerDetallesProcesosGerente,
} from "../../../features/procesos/services/procesosService";
import { supabase } from "../../../lib/supabase";

vi.mock("../../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

function mockFrom({ select, in: inFn, order, resolveWith } = {}) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(resolveWith),
  };
  vi.mocked(supabase.from).mockReturnValue(chain);
  return chain;
}

describe("Test Api - procesosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("obtenerProcesosActivos", () => {
    it("retorna un array de procesos cuando la consulta es exitosa", async () => {
      // ARRANGE
      const mockData = [
        { pro_id_proceso: 1, pro_estado: "activo", rc_nombre: "Cofre A" },
        { pro_id_proceso: 2, pro_estado: "en_proceso", rc_nombre: "Cofre B" },
      ];
      mockFrom({ resolveWith: { data: mockData, error: null } });

      // ACT
      const result = await obtenerProcesosActivos();

      // ASSERT
      expect(result).to.be.an("array").with.lengthOf(2).and.not.be.undefined;

      expect(result[0]).to.have.property("pro_id_proceso").equal(1);

      expect(result[1]).to.have.property("pro_estado").equal("en_proceso");
    });

    it("lanza un error cuando supabase retorna error", async () => {
      // ARRANGE
      // Se Simula que la BD falla
      mockFrom({ resolveWith: { data: null, error: { message: "DB error" } } });

      // ACT & ASSERT
      // se verifica el throw
      await expect(obtenerProcesosActivos()).rejects.toThrow("DB error");
    });
  });

  describe("obtenerHistorialProcesos", () => {
    it("retorna el historial ordenado por fecha de fin ", async () => {
      // ARRANGE
      const mockData = [
        {
          pro_id_proceso: 10,
          pro_fecha_fin: "2024-05-01",
          rc_nombre: "Cofre X",
        },
        {
          pro_id_proceso: 11,
          pro_fecha_fin: "2024-03-15",
          rc_nombre: "Cofre Y",
        },
      ];

      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(chain);

      // ACT
      const result = await obtenerHistorialProcesos();

      // ASSERT
      expect(result).to.be.an("array").with.lengthOf(2);

      // se verifica q si se llamo a la q es
      expect(supabase.from).toHaveBeenCalledWith("vw_historial_trabajador");

      // se verifica orden correcto descendente por fecha de fin
      expect(chain.order).toHaveBeenCalledWith("pro_fecha_fin", {
        ascending: false,
      });
    });

    it("lanza un error cuando supabase retorna error", async () => {
      // ARRANGE
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Sin conexión" },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(chain);

      // ACT & ASSERT
      await expect(obtenerHistorialProcesos()).rejects.toThrow("Sin conexión");
    });
  });

  describe("crearProceso", () => {
    it("retorna el id del proceso creado cuando el rpc es exitoso", async () => {
      // ARRANGE
      const mockProcesoId = 42;
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockProcesoId,
        error: null,
      });

      // ACT
      const result = await crearProceso(99); // referenciaId = 99

      // ASSERT
      expect(result).to.equal(42);

      //se verifica q si se llamo y con el parametro correcto
      expect(supabase.rpc).toHaveBeenCalledWith("sp_crear_proceso", {
        p_referencia_id: 99,
      });
    });

    it("lanza un error cuando el rpc falla", async () => {
      // ARRANGE
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Referencia no encontrada" },
      });

      // ACT & ASSERT
      await expect(crearProceso(999)).rejects.toThrow(
        "Referencia no encontrada",
      );
    });
  });
  describe("obtenerFaseActualProcesos", () => {
    it("retorna las fases actuales de todos los procesos", async () => {
      // ARRANGE
      const mockData = [
        {
          pro_id_proceso: 1,
          siguiente_cargo_nombre: "Pulido",
          fases_completadas: 2,
        },
        {
          pro_id_proceso: 2,
          siguiente_cargo_nombre: "Pintura",
          fases_completadas: 1,
        },
      ];

      const chain = {
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(chain);

      // ACT
      const result = await obtenerFaseActualProcesos();

      // ASSERT
      expect(result).to.be.an("array").with.lengthOf(2);

      expect(result[0])
        .to.have.property("siguiente_cargo_nombre")
        .equal("Pulido");

      expect(supabase.from).toHaveBeenCalledWith("vw_fase_actual");
    });

    it("lanza un error cuando supabase retorna error", async () => {
      // ARRANGE
      const chain = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Vista no encontrada" },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(chain);

      // ACT & ASSERT
      await expect(obtenerFaseActualProcesos()).rejects.toThrow(
        "Vista no encontrada",
      );
    });
  });

  describe("validarSiguienteFase", () => {
    it("retorna true cuando la fase es correcta", async () => {
      // ARRANGE
      vi.mocked(supabase.rpc).mockResolvedValue({ data: true, error: null });

      // ACT
      const result = await validarSiguienteFase(1, 3); // procesoId=1, cargoId=3

      // ASSERT
      expect(result).to.be.true;

      expect(supabase.rpc).toHaveBeenCalledWith("sp_validar_siguiente_fase", {
        p_proceso_id: 1,
        p_cargo_id: 3,
      });
    });

    it("retorna false cuando la fase no es correcta", async () => {
      // ARRANGE
      vi.mocked(supabase.rpc).mockResolvedValue({ data: false, error: null });

      // ACT
      const result = await validarSiguienteFase(1, 99);

      // ASSERT
      expect(result).to.be.false;
    });

    it("lanza un error cuando el rpc falla", async () => {
      // ARRANGE
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Error validando fase" },
      });

      // ACT & ASSERT
      await expect(validarSiguienteFase(1, 3)).rejects.toThrow(
        "Error validando fase",
      );
    });
  });

  describe("obtenerDetallesProcesosGerente", () => {
    it("retorna los detalles del dashboard del gerente", async () => {
      // ARRANGE
      const mockData = [
        {
          pro_id_proceso: 1,
          pro_codigo_cofre: "COF-001",
          pro_estado: "activo",
          rc_nombre: "Referencia A",
          fase_actual: "Pulido",
          fases: '[{"orden":1,"fase":"Pulido"}]',
        },
      ];

      const chain = {
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(chain);

      // ACT
      const result = await obtenerDetallesProcesosGerente();

      // ASSERT
      expect(result).to.be.an("array").with.lengthOf(1);

      expect(result[0]).to.have.property("pro_codigo_cofre").equal("COF-001");

      expect(supabase.from).toHaveBeenCalledWith("vista_dashboard_gerente");

      // que se pida los campos correctos
      expect(chain.select).toHaveBeenCalledWith(
        "pro_id_proceso, pro_codigo_cofre, pro_estado, pro_fecha_inicio, rc_nombre, rc_codigo, fase_actual, fases",
      );
    });

    it("lanza un error cuando supabase retorna error", async () => {
      // ARRANGE
      const chain = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Sin permisos" },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(chain);

      // ACT & ASSERT
      await expect(obtenerDetallesProcesosGerente()).rejects.toThrow(
        "Sin permisos",
      );

      expect(supabase.from).toHaveBeenCalledWith("vista_dashboard_gerente");
    });
  });
});
