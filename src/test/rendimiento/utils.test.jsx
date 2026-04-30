import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { detectarCambios } from "../../utils/construirMatrizTarifas";
import { calcularDuracion } from "../../utils/tiempo";

function crearMatriz(numCofres, numCargos, valorBase = 100) {
  const matriz = {};
  for (let c = 1; c <= numCofres; c++) {
    matriz[c] = {};
    for (let k = 1; k <= numCargos; k++) {
      matriz[c][k] = valorBase;
    }
  }
  return matriz;
}

function crearMatrizModificada(
  numCofres,
  numCargos,
  valorOriginal = 100,
  valorNuevo = 200,
) {
  const original = crearMatriz(numCofres, numCargos, valorOriginal);
  const editable = crearMatriz(numCofres, numCargos, valorNuevo);
  return { original, editable };
}

describe("detectarCambios  correctitud", () => {
  it("[COR-01] sin cambios  retorna array vacío", () => {
    // Arrange
    const original = { 1: { 10: 500, 20: 300 } };
    const editable = { 1: { 10: 500, 20: 300 } };

    // Act
    const result = detectarCambios(original, editable);

    // Assert
    expect(result).toEqual([]);
  });

  it("[COR-02] un cambio →retorna exactamente ese cambio con tipos correctos", () => {
    // Arrange
    const original = { 1: { 10: 500 } };
    const editable = { 1: { 10: 750 } };

    // Act
    const result = detectarCambios(original, editable);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      cofreId: 1,
      trabajadorCargoId: 10,
      valor: 750,
    });
  });

  it("[COR-03] valor borrado (string vacío) valor: null en el cambio", () => {
    // Arrange
    const original = { 2: { 5: 400 } };
    const editable = { 2: { 5: "" } };

    // Act
    const result = detectarCambios(original, editable);

    // Assert
    expect(result[0].valor).toBeNull();
  });

  it("[COR-04] campo nuevo sin original (undefined) con valor detecta cambio", () => {
    const original = {};
    const editable = { 3: { 7: 150 } };

    // Act
    const result = detectarCambios(original, editable);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].valor).toBe(150);
  });

  it('[COR-05] "100" string vs 100 number → NO detecta cambio ', () => {
    // Arrange
    const original = { 1: { 1: 100 } };
    const editable = { 1: { 1: "100" } };

    // Act
    const result = detectarCambios(original, editable);

    // Assert — Number('100') === Number(100), no debe generar falso positivo
    expect(result).toEqual([]);
  });

  it("[COR-06] multiple cofres con mezcla de cambios y sin cambios", () => {
    // Arrange
    const original = {
      1: { 10: 100, 20: 200 },
      2: { 10: 300, 20: 400 },
    };
    const editable = {
      1: { 10: 100, 20: 999 }, // solo cambia 20
      2: { 10: 300, 20: 400 }, // sin cambios
    };

    // Act
    const result = detectarCambios(original, editable);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      cofreId: 1,
      trabajadorCargoId: 20,
      valor: 999,
    });
  });
});

describe("detectarCambios  rendimiento", () => {
  it("[PERF-01] matriz 50x50 (2500 celdas, sin cambios) → < 10ms", () => {
    // Arrange
    const original = crearMatriz(50, 50, 100);
    const editable = crearMatriz(50, 50, 100);

    // Act
    const start = performance.now();
    const result = detectarCambios(original, editable);
    const elapsed = performance.now() - start;

    // Assert
    expect(result).toHaveLength(0);
    expect(elapsed).toBeLessThan(10);
  });

  it("[PERF-02] matriz 50x50 y que todos cambien", () => {
    // Arrange — peor escenario: 2500 cambios a emitir
    const { original, editable } = crearMatrizModificada(50, 50, 100, 200);

    // Act
    const start = performance.now();
    const result = detectarCambios(original, editable);
    const elapsed = performance.now() - start;

    // Assert
    expect(result).toHaveLength(2500);
    expect(elapsed).toBeLessThan(15);
  });

  it("[PERF-03] matriz 100x100 yq todos cambien", () => {
    // Arrange — escenario extremo, muy por encima del uso real
    const { original, editable } = crearMatrizModificada(100, 100, 50, 51);

    // Act
    const start = performance.now();
    const result = detectarCambios(original, editable);
    const elapsed = performance.now() - start;

    // Assert
    expect(result).toHaveLength(10000);
    expect(elapsed).toBeLessThan(30);
  });

  it("[PERF-04] llamadas repetidas 100 veces", () => {
    // Arrange
    const { original, editable } = crearMatrizModificada(20, 20, 10, 20);
    const tiempos = [];

    // Act
    for (let i = 0; i < 100; i++) {
      const t = performance.now();
      detectarCambios(original, editable);
      tiempos.push(performance.now() - t);
    }

    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    const ultima = tiempos[tiempos.length - 1];

    // Assert
    expect(promedio).toBeLessThan(5);
    expect(ultima).toBeLessThan(promedio * 2 + 1);
  });
});

describe("calcularDuracion › correctitud", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('[COR-07] fecha null/undefined → "Sin Iniciar"', () => {
    expect(calcularDuracion(null)).toBe("Sin Iniciar");
    expect(calcularDuracion(undefined)).toBe("Sin Iniciar");
    expect(calcularDuracion("")).toBe("Sin Iniciar");
  });

  it('[COR-08] fecha invalida → "Fecha invalida"', () => {
    expect(calcularDuracion("no-es-una-fecha")).toBe("Fecha inválida");
  });

  it('[COR-09] fecha futura → "0 min"', () => {
    // Arrange
    vi.setSystemTime(new Date("2024-01-01T10:00:00Z"));

    // Act
    const result = calcularDuracion("2024-01-01T11:00:00Z");

    // Assert
    expect(result).toBe("0 min");
  });

  it('[COR-10] diff de 45 minutos  "45 min"', () => {
    // Arrange
    vi.setSystemTime(new Date("2024-06-15T10:45:00Z"));

    // Act
    const result = calcularDuracion("2024-06-15T10:00:00Z");

    // Assert
    expect(result).toBe("45 min");
  });

  it('[COR-11] diff de 2h 30min → "2h 30min"', () => {
    // Arrange
    vi.setSystemTime(new Date("2024-06-15T12:30:00Z"));

    // Act
    const result = calcularDuracion("2024-06-15T10:00:00Z");

    // Assert
    expect(result).toBe("2h 30min");
  });

  it('[COR-12] diff de 1 día 3 horas → "1d 3h"', () => {
    // Arrange
    vi.setSystemTime(new Date("2024-06-16T13:00:00Z"));

    // Act
    const result = calcularDuracion("2024-06-15T10:00:00Z");

    // Assert
    expect(result).toBe("1d 3h");
  });

  it("[COR-13] fecha sin Z → se normaliza igual que con Z", () => {
    // Arrange
    vi.setSystemTime(new Date("2024-06-15T11:00:00Z"));

    const conZ = calcularDuracion("2024-06-15T10:00:00Z");
    const sinZ = calcularDuracion("2024-06-15T10:00:00");

    // Assert
    expect(sinZ).toBe(conZ);
  });

  it('[COR-14] exactamente 60 minutos → "1h 0min" (no "60 min")', () => {
    // Arrange —
    vi.setSystemTime(new Date("2024-06-15T11:00:00Z"));

    // Act
    const result = calcularDuracion("2024-06-15T10:00:00Z");

    // Assert
    expect(result).toBe("1h 0min");
  });
});

describe("calcularDuracion › rendimiento", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("[PERF-05] 10 000 llamadas consecutivas → < 50ms total", () => {
    // Arrange
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    const fechas = [
      "2024-06-15T10:00:00Z", // 2h
      "2024-06-14T10:00:00Z", // 1d 2h
      "2024-06-15T11:45:00Z", // 15 min
      null, // Sin Iniciar
      "invalida", // Fecha inválida
    ];

    // Act
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      calcularDuracion(fechas[i % fechas.length]);
    }
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(50);
  });

  it("[PERF-06] llamada con fecha válida → < 1ms individual", () => {
    // Arrange
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));

    // Act
    const start = performance.now();
    calcularDuracion("2024-06-15T10:00:00Z");
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(1);
  });

  it("[PERF-07] mezcla de inputs validos e invalidos sin degradación", () => {
    // Arrange
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    const inputs = Array.from({ length: 1000 }, (_, i) =>
      i % 3 === 0 ? null : i % 3 === 1 ? "basura" : "2024-06-15T10:00:00Z",
    );

    // Act
    const start = performance.now();
    inputs.forEach(calcularDuracion);
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(20);
  });
});
