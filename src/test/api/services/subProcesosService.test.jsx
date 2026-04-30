import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getHistorialSubprocesosTrabajadorNoPagado,
  getInformacionSubprocesoActual,
  crearSubproceso,
  finalizarSubproceso,
} from "../../../features/subProcesos/service/subProcesosService";
import { supabase } from "../../../lib/supabase";

vi.mock("../../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

function mockFromSelect(resolveWith) {
  const chain = {
    select: vi.fn().mockResolvedValue(resolveWith),
  };
  vi.mocked(supabase.from).mockReturnValue(chain);
  return chain;
}

describe("Test Api - subProcesosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHistorialSubprocesosTrabajadorNoPagado", () => {
    it("retorna el historial de subprocesos pendientes de pago", async () => {
      // ARRANGE
      const mockData = [
        {
          sub_id_subproceso: 1,
          sub_proceso_id: 10,
          t_nombre: "Carlos Pérez",
          c_nombre: "Pulido",
          sub_fecha_fin: "2024-05-01",
        },
        {
          sub_id_subproceso: 2,
          sub_proceso_id: 11,
          t_nombre: "Ana Gómez",
          c_nombre: "Pintura",
          sub_fecha_fin: "2024-05-03",
        },
      ];
      mockFromSelect({ data: mockData, error: null });

      // ACT
      const result = await getHistorialSubprocesosTrabajadorNoPagado();

      // ASSERT
      expect(result).to.be.an("array").with.lengthOf(2).and.not.be.undefined;

      expect(result[0]).to.have.property("sub_id_subproceso").equal(1);

      expect(result[0]).to.have.property("t_nombre").equal("Carlos Pérez");

      expect(supabase.from).toHaveBeenCalledWith(
        "vw_historial_subprocesos_pendientes",
      );
    });

    it("retorna un array vacio cuando no hay subprocesos pendientes de pago", async () => {
      // ARRANGE
      mockFromSelect({ data: [], error: null });

      // ACT
      const result = await getHistorialSubprocesosTrabajadorNoPagado();

      // ASSERT
      expect(result).to.be.an("array").with.lengthOf(0);
    });

    it("Lanza el error de supabase cuando la vista falla", async () => {
      //arrange
      const supabaseError = { message: "Vista no encontrada", code: "42P01" };
      mockFromSelect({ data: null, error: supabaseError });

      //act & assert
      //throw error
      await expect(getHistorialSubprocesosTrabajadorNoPagado()).rejects.toEqual(
        supabaseError,
      );

      //act y asseert
    });
  });

  describe("getInformacionSubprocesoActual", () => {
    it("retorna la información del subproceso activo del trabajador", async () => {
      // ARRANGE
      const mockData = [
        {
          sub_id_subproceso: 5,
          sub_proceso_id: 20,
          sub_fecha_inicio: "2024-05-10T08:00:00",
          sub_estado: "en_proceso",
          t_nombre: "Juan Torres",
          c_nombre: "Grabado",
          c_orden_proceso: 3,
        },
      ];
      mockFromSelect({ data: mockData, error: null });

      // ACT
      const result = await getInformacionSubprocesoActual();

      // ASSERT
      expect(result).to.be.an("array").with.lengthOf(1).and.not.be.undefined;
      expect(result[0]).to.have.property("sub_id_subproceso").equal(5);
      expect(supabase.from).toHaveBeenCalledWith(
        "vw_informacion_subproceso_actual",
      );
    });

    it("retorna un array vacio cuando no hay subproceso activo", async () => {
      // ARRANGE
      mockFromSelect({ data: [], error: null });

      // ACT
      const result = await getInformacionSubprocesoActual();

      // ASSERT
      expect(result).to.be.an("array").with.lengthOf(0);
    });

    it("Lanza el error de supabase cuando supabase falla", async () => {
      //arrange
      const supabaseError = { message: "Sin permisos", code: "42501" };
      mockFromSelect({ data: null, error: supabaseError });

      //act & assert
      await expect(getInformacionSubprocesoActual()).rejects.toEqual(
        supabaseError,
      );
    });
  });

  describe("crearSubproceso", () => {
    it("retorna true cuando el subproceso se crea correctamente", async () => {
      // ARRANGE
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

      // ACT
      const result = await crearSubproceso(2, 10, 5); // cargoId, procesoId, trabajadorId

      // ASSERT
      expect(result).to.be.true;
      expect(supabase.rpc).toHaveBeenCalledWith("sp_crear_subproceso", {
        p_cargo_id: 2,
        p_proceso_id: 10,
        p_trabajador_id: 5,
      });
    });

    it("Que si se esten mandando los parametros en el orden correcto ", async () => {
      // ARRANGE
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

      // ACT
      await crearSubproceso(3, 7, 10); // cargoId, procesoId, trabajadorId

      // ASSERT
      expect(supabase.rpc).toHaveBeenCalledWith("sp_crear_subproceso", {
        p_cargo_id: 3,
        p_proceso_id: 7,
        p_trabajador_id: 10,
      });
    });

    it("lanza un error cuando el rpc falla", async () => {
      // ARRANGE
      const supabaseError = {
        message: "Error al crear subproceso",
        code: "500",
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      // ACT & ASSERT
      await expect(crearSubproceso(1, 5, 3)).rejects.toEqual(supabaseError);
    });
  });
  describe("finalizarSubproceso", () => {
    it("retorna los datos cuando el subproceso se finaliza exitosamente", async () => {
      // ARRANGE
      const mockResultado = { pro_id_proceso: 10, siguiente_fase: "Pintura" };
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResultado,
        error: null,
      });

      const datosEntrada = {
        p_foto_path: "evidencias/cofre-10/pulido.jpg",
        p_sub_id_subproceso: 5,
      };

      // ACT
      const result = await finalizarSubproceso(datosEntrada);

      // ASSERT
      expect(result).to.deep.equal(mockResultado).and.not.be.undefined;
      expect(supabase.rpc).toHaveBeenCalledWith("sp_finalizar_subproceso", {
        p_foto_path: "evidencias/cofre-10/pulido.jpg",
        p_sub_id_subproceso: 5,
      });
    });
    it("Funciona cuando p_foto_path es nulll", async () => {
      // ARRANGE
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null,
      });

      const datosEntrada = {
        p_foto_path: null,
        p_sub_id_subproceso: 5,
      };

      // ACT
      const result = await finalizarSubproceso(datosEntrada);

      // ASSERT
      expect(result).to.be.true;
      expect(supabase.rpc).toHaveBeenCalledWith("sp_finalizar_subproceso", {
        p_foto_path: null,
        p_sub_id_subproceso: 5,
      });
    });

    it("Lanza error cuando supabase falla", async () => {
      //arrange
      const supabaseError = {
        message: "Subproceso ya finalizado",
        code: "P0002",
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      const datos = {
        p_sub_id_subproceso: 5,
        p_foto_path: "evidencias/cofre-10/pulido.jpg",
      };

      //act y assert
      await expect(finalizarSubproceso(datos)).rejects.toEqual(supabaseError);
    });
  });
});
