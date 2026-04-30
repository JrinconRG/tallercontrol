import {
  obtenerTrabajadoresPorCargo,
  getTrabajadoresSelect,
  getInformacionEmpleados,
  crearEmpleado,
  asignarCargo,
  designarCargo,
} from "../../../features/Trabajadores/services/trabajadorService";
import { supabase } from "../../../lib/supabase";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

//helpeerrs

function mockFromSelect(resolveWith) {
  const chain = {
    select: vi.fn().mockResolvedValue(resolveWith),
  };
  vi.mocked(supabase.from).mockReturnValue(chain);
  return chain;
}

describe("test API trabajadoresService", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("designarCargo", async () => {
    it("Retorna error si alguno de los campos no fue enviado", async () => {
      // Arrange
      const cargoIdInvalido = null;
      const trabajadorIdMock = 21;

      // Act & Assert
      await expect(
        designarCargo({
          cargoId: cargoIdInvalido,
          trabajadorId: trabajadorIdMock,
        }),
      ).rejects.toThrow("Todos los campos son  requerido");

      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("Retorna true si fue exitoso designar el cargo al empleado", async () => {
      // Arrange
      const cargoIdMock = 12;
      const trabajadorIdMock = 21;
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null });

      // Act
      const result = await designarCargo({
        cargoId: cargoIdMock,
        trabajadorId: trabajadorIdMock,
      });

      // Assert
      expect(result).to.be.true;
      expect(supabase.rpc).toHaveBeenCalledWith(
        "sp_eliminar_cargo_trabajador",
        {
          p_trabajador_id: trabajadorIdMock,
          p_cargo_id: cargoIdMock,
        },
      );
    });

    it("Lanza error si la base de datos falla", async () => {
      // Arrange
      const errorMock = { message: "Error al eliminar cargo" };
      vi.mocked(supabase.rpc).mockResolvedValue({ error: errorMock });

      // Act & Assert
      await expect(
        designarCargo({ cargoId: 1, trabajadorId: 1 }),
      ).rejects.toThrow(errorMock.message);
    });
  });

  describe("asignarCargo", async () => {
    it("Retorna error si alguno de los campos no fue enviado", async () => {
      // Act & Assert
      await expect(
        asignarCargo({ cargoId: 12, trabajadorId: null }),
      ).rejects.toThrow("Todos los campos son  requerido");

      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("Retorna true si fue exitoso asignar el cargo al empleado", async () => {
      // Arrange
      const params = { cargoId: 10, trabajadorId: 5 };
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null });

      // Act
      const result = await asignarCargo(params);

      // Assert
      expect(result).to.be.true;
      expect(supabase.rpc).toHaveBeenCalledWith("sp_agregar_cargo_trabajador", {
        p_trabajador_id: 5,
        p_cargo_id: 10,
      });
    });

    it("Lanza error si la base de datos falla", async () => {
      // Arrange
      const errorMock = { message: "DB Error" };
      vi.mocked(supabase.rpc).mockResolvedValue({ error: errorMock });

      // Act & Assert
      await expect(
        asignarCargo({ cargoId: 1, trabajadorId: 1 }),
      ).rejects.toThrow(errorMock.message);
    });
  });

  describe("getInformacionEmpleados", async () => {
    it("Retorna la informacion de los empleados correctamente", async () => {
      // Arrange
      const respuestaMock = [
        {
          t_id: 12,
          trabajador_nombre_completo: "Juana Maria",
          t_numero_de_documento: "1515151",
          t_celular: "12212312",
          cargos: [{ id: 12, nombre: "Pulidor" }],
        },
      ];
      mockFromSelect({ data: respuestaMock, error: null });

      // Act
      const result = await getInformacionEmpleados();

      // Assert
      expect(result).to.be.an("array").and.to.deep.equal(respuestaMock);
      expect(result[0])
        .to.have.property("t_numero_de_documento")
        .equal("1515151");
      expect(supabase.from).toHaveBeenCalledWith("vw_trabajadores_con_cargos");
    });

    it("Retorna una lista vacia si no hay informacion de los trabajadores", async () => {
      // Arrange
      mockFromSelect({ data: [], error: null });

      // Act
      const result = await getInformacionEmpleados();

      // Assert
      expect(result).to.be.an("array").and.empty;
      expect(result).to.have.lengthOf(0);
    });

    it("Lanza error si la base de datos falla", async () => {
      // Arrange
      const errorMock = { message: "Error de conexión" };
      mockFromSelect({ data: null, error: errorMock });

      // Act & Assert
      await expect(getInformacionEmpleados()).rejects.toThrow(
        errorMock.message,
      );
    });
  });

  describe("crearEmpleado", async () => {
    it("Retorna error si alguno de los campos no fue enviado", async () => {
      // Act & Assert
      await expect(crearEmpleado({ nombre: "Juana", apellidos: "Rincon" })) // Faltan campos
        .rejects.toThrow(
          "Todos los campos (nombre, apellidos, documento y celular) son obligatorios.",
        );

      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("Retorna trabajador_id si fue exito crear al empleado", async () => {
      // Arrange
      const nuevoEmpleado = {
        nombre: "Juana",
        apellidos: "Rincon",
        numeroDocumento: "102030",
        celular: "300400",
      };
      const idEsperado = 99;
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: idEsperado,
        error: null,
      });

      // Act
      const result = await crearEmpleado(nuevoEmpleado);

      // Assert
      expect(result).to.be.a("number").and.equal(idEsperado);
      expect(supabase.rpc).toHaveBeenCalledWith("sp_crear_trabajador", {
        p_nombre: nuevoEmpleado.nombre,
        p_apellidos: nuevoEmpleado.apellidos,
        p_numero_de_documento: nuevoEmpleado.numeroDocumento,
        p_celular: nuevoEmpleado.celular,
      });
    });

    it("Lanza error si la base de datos falla", async () => {
      // Arrange
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Error SP" },
      });

      // Act & Assert
      await expect(
        crearEmpleado({
          nombre: "a",
          apellidos: "b",
          numeroDocumento: "c",
          celular: "d",
        }),
      ).rejects.toThrow("Error SP");
    });
  });

  describe("getTrabajadoresSelect", () => {
    it("Retorna los trabajadores para el select correctamente", async () => {
      // arrange
      const respuestaMock = [
        { t_id: 12, trabajador_nombre_completo: "Juana Maria" },
      ];
      mockFromSelect({ data: respuestaMock, error: null });

      // act
      const result = await getTrabajadoresSelect();

      // assert
      expect(result).to.be.an("array").and.to.deep.equal(respuestaMock);
      expect(result[0]).to.have.property("t_id").equal(12);
      expect(supabase.from).toHaveBeenCalledWith("vw_trabajadores_select");
    });

    it("Retorna una lista vacia si no hay trabajadores", async () => {
      // arrange
      mockFromSelect({ data: [], error: null });

      // act
      const result = await getTrabajadoresSelect();

      //assert
      expect(result).to.be.an("array").and.to.have.lengthOf(0);
      expect(result).to.deep.equal([]);

      expect(supabase.from).toHaveBeenCalledWith("vw_trabajadores_select");
    });

    it("Lanza error si la base de datos falla", async () => {
      // arrange
      const errorMock = { message: "Error de conexion", code: "599" };
      mockFromSelect({ data: null, error: errorMock });

      //  ACT
      await expect(getTrabajadoresSelect()).rejects.toThrow(errorMock.message);

      //assert
      expect(supabase.from).toHaveBeenCalledWith("vw_trabajadores_select");
    });
  });

  describe("obtenerTrabajadoresPorCargo", async () => {
    it("retorna los trabajadores por cargo", async () => {
      //arange
      const cargoIdMock = 12;
      const dataRespuestaMock = [
        {
          t_id: 12,
          t_nombre: "Felix ",
          t_apellidos: "Prada",
          cargo_id: 1,
        },
      ];

      //mock de supabase from().select().eq
      const eqMock = vi
        .fn()
        .mockResolvedValue({ data: dataRespuestaMock, error: null });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

      vi.mocked(supabase.from).mockReturnValue({ select: selectMock });

      //act
      const result = await obtenerTrabajadoresPorCargo(cargoIdMock); //cargoId

      //assert
      expect(result).to.be.an("array").and.to.deep.equal(dataRespuestaMock);
      expect(result).to.have.lengthOf(1);
      expect(supabase.from).toHaveBeenCalledWith("vw_trabajadores_por_cargo");
      expect(eqMock).toHaveBeenCalledWith("cargo_id", cargoIdMock);
      expect(eqMock).toHaveBeenCalledTimes(1);
    });

    it("Lanza error y no se ejecuta si cargoId es null", async () => {
      //arrange
      const cargoIdMock = null;

      //act
      await expect(obtenerTrabajadoresPorCargo(cargoIdMock)).rejects.toThrow(
        "cargoId es requerido",
      );

      //assert
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("Error de respuesta en la base de datos", async () => {
      //arrange
      const errorMock = { message: "Error de conexion", code: "599" };
      const eqMock = vi
        .fn()
        .mockResolvedValue({ data: null, error: errorMock });

      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

      vi.mocked(supabase.from).mockReturnValue({ select: selectMock });

      //act
      await expect(obtenerTrabajadoresPorCargo(12)).rejects.toEqual(errorMock);

      //asert
      expect(supabase.from).toHaveBeenCalledWith("vw_trabajadores_por_cargo");
    });
    it("retorna una lista vacía si el cargo no tiene trabajadores asociados", async () => {
      // --- ARRANGE ---
      const cargoIdSinEmpleados = 99;

      const eqMock = vi.fn().mockResolvedValue({ data: [], error: null });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

      vi.mocked(supabase.from).mockReturnValue({ select: selectMock });

      // act
      const result = await obtenerTrabajadoresPorCargo(cargoIdSinEmpleados);

      // assert
      expect(result).to.be.an("array").and.to.have.lengthOf(0);
      expect(result).to.deep.equal([]);

      expect(eqMock).toHaveBeenCalledWith("cargo_id", cargoIdSinEmpleados);
    });
  });
});
