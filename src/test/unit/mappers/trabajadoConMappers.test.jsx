import { describe, it, expect } from "vitest";
import { trabajadorConCargosMapper } from "../../../features/Trabajadores/domain/mappers/trabajadorConCargosMapper";
import { Trabajador } from "../../../features/Trabajadores/domain/entities/Trabajador";

const ROW_VALIDO = {
  t_id: "trab-001",
  nombre_completo: "Carlos Ruiz",
  t_numero_de_documento: "12345678",
  t_celular: "3001234567",
  cargos: JSON.stringify([
    { cargo_id: 1, cargo_nombre: "Pintor" },
    { cargo_id: 2, cargo_nombre: "Lijador" },
  ]),
};

describe("trabajadorConCargosMapper › correctitud", () => {
  it("[COR-01] row válido → retorna instancia de Trabajador con campos correctos", () => {
    // Arrange + Act
    const result = trabajadorConCargosMapper(ROW_VALIDO);

    // Assert
    expect(result).toBeInstanceOf(Trabajador);
    expect(result.id).toBe("trab-001");
    expect(result.nombre).toBe("Carlos Ruiz");
    expect(result.documento).toBe("12345678");
    expect(result.celular).toBe("3001234567");
  });

  it("[COR-02] cargos como JSON string → se parsea correctamente", () => {
    // Arrange + Act
    const result = trabajadorConCargosMapper(ROW_VALIDO);

    // Assert
    expect(result.cargos).toHaveLength(2);
  });

  it("[COR-03] cargos ya es array (no string) → no falla, se usa directo", () => {
    // Arrange
    const row = {
      ...ROW_VALIDO,
      cargos: [{ cargo_id: 1, cargo_nombre: "Mecanico" }],
    };

    // Act
    const result = trabajadorConCargosMapper(row);

    // Assert
    expect(result.cargos).toHaveLength(1);
  });

  it("[COR-04] cargos JSON ivalido → cargos queda como array vacio, no lanza", () => {
    // Arrange
    const row = { ...ROW_VALIDO, cargos: "{malformed json[[" };

    // Act
    const result = trabajadorConCargosMapper(row);

    // Assert
    expect(result.cargos).toEqual([]);
  });

  it("[COR-05] cargos null  cargos queda como array vacío", () => {
    // Arrange
    const row = { ...ROW_VALIDO, cargos: null };

    // Act
    const result = trabajadorConCargosMapper(row);

    // Assert
    expect(result.cargos).toEqual([]);
  });

  it('[COR-06] cargos "[]" string vacio → array vacio parseado', () => {
    // Arrange
    const row = { ...ROW_VALIDO, cargos: "[]" };

    // Act
    const result = trabajadorConCargosMapper(row);

    // Assert
    expect(result.cargos).toEqual([]);
  });

  it("[COR-07] apellidos siempre es string vacío (campo no viene del row)", () => {
    // Arrange + Act
    const result = trabajadorConCargosMapper(ROW_VALIDO);

    // Assert — documentar comportamiento actual explícitamente
    expect(result.apellidos).toBe("");
  });
});

describe("trabajadorConCargosMapper › rendimiento", () => {
  it("[PERF-01] 1000 rows mapeados → < 30ms", () => {
    // Arrange
    const rows = Array.from({ length: 1000 }, (_, i) => ({
      ...ROW_VALIDO,
      t_id: `trab-${i}`,
      nombre_completo: `Trabajador ${i}`,
    }));

    // Act
    const start = performance.now();
    rows.forEach(trabajadorConCargosMapper);
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(30);
  });

  it("[PERF-02] row con cargos JSON largo (50 cargos) → < 2ms individual", () => {
    // Arrange
    const cargosGrandes = Array.from({ length: 50 }, (_, i) => ({
      cargo_id: i,
      cargo_nombre: `Cargo tipo ${i}`,
      descripcion: "descripcion larga ".repeat(10),
    }));
    const row = { ...ROW_VALIDO, cargos: JSON.stringify(cargosGrandes) };

    // Act
    const start = performance.now();
    trabajadorConCargosMapper(row);
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(2);
  });

  it("[PERF-03] JSON malformado en bulk (500 rows corruptos) → < 20ms sin explotar", () => {
    // Arrange
    const rows = Array.from({ length: 500 }, (_, i) => ({
      ...ROW_VALIDO,
      t_id: `bad-${i}`,
      cargos: "{corrupto[[",
    }));

    // Act
    const start = performance.now();
    const results = rows.map(trabajadorConCargosMapper);
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(20);
    results.forEach((r) => expect(r.cargos).toEqual([]));
  });
});
