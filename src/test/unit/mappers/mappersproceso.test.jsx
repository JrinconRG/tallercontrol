import { describe, it, expect } from "vitest";
import { dashboardMapper } from "../../../features/procesos/domain/mappers/dashboardMapper";
import { historialProcesosMapper } from "../../../features/procesos/domain/mappers/historialMapper";
import { procesoMapper } from "../../../features/procesos/domain/mappers/procesoMapper";
import { Proceso } from "../../../features/procesos/domain/entities/Proceso";

// ── Fixtures ─────────────────────────────────────────────────────────────────
const FASES_JSON = JSON.stringify([
  {
    sub_id: "sub-1",
    fase: "Pintura",
    orden: 1,
    valor: 150000,
    fecha_inicio: "2024-01-10T08:00:00Z",
    fecha_fin: null,
    duracion: null,
    foto: ["foto1.jpg", "foto2.jpg"],
    estado: "En_Proceso",
    trabajador: "Ana Torres",
  },
]);

const ITEM_DASHBOARD = {
  pro_id_proceso: "proc-001",
  pro_codigo_cofre: "COF-001",
  pro_estado: "activo",
  rc_nombre: "Referencia A",
  rc_codigo: "REF-A",
  pro_fecha_inicio: "2024-01-10T08:00:00Z",
  fase_actual: 1,
  fases: FASES_JSON,
};

const ITEM_HISTORIAL = {
  pro_id_proceso: "proc-002",
  pro_codigo_cofre: "COF-002",
  pro_estado: "finalizado",
  pro_fecha_inicio: "2024-01-01T08:00:00Z",
  pro_fecha_fin: "2024-01-20T17:00:00Z",
  rc_nombre: "Referencia B",
  rc_codigo: "REF-B",
  total_acumulado: 500000,
  detalle_subprocesos: [
    {
      sub_id: "sub-2",
      proceso_id: "proc-002",
      trabajador: "Luis Gómez",
      fase: "Lijado",
      orden: 1,
      valor: 200000,
      fecha_inicio: "2024-01-01T08:00:00Z",
      fecha_fin: "2024-01-10T17:00:00Z",
      duracion: "9d 9h",
      foto: "foto_final.jpg",
    },
  ],
};

const ROW_PROCESO = {
  pro_id_proceso: "proc-003",
  pro_codigo_cofre: "COF-003",
  pro_referencia_id: "ref-001",
  pro_estado: "en_proceso",
  pro_fecha_inicio: "2024-02-01T08:00:00Z",
  pro_fecha_fin: null,
  pro_pagado: false,
  rc_codigo: "REF-C",
  rc_nombre: "Referencia C",
  total_a_realizar: 5,
  total_finalizadas: 2,
};

// ═══════════════════════════════════════════════════════════════════════════
describe("dashboardMapper › correctitud", () => {
  it("[COR-01] item único (objeto) → retorna array de un Proceso", () => {
    // Arrange + Act
    const result = dashboardMapper(ITEM_DASHBOARD);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Proceso);
  });

  it("[COR-02] array de items → retorna array del mismo tamaño", () => {
    // Arrange + Act
    const result = dashboardMapper([ITEM_DASHBOARD, ITEM_DASHBOARD]);

    // Assert
    expect(result).toHaveLength(2);
  });

  it("[COR-03] campos del proceso se mapean correctamente", () => {
    // Arrange + Act
    const [proceso] = dashboardMapper(ITEM_DASHBOARD);

    // Assert
    expect(proceso.id).toBe("proc-001");
    expect(proceso.codigoCofre).toBe("COF-001");
    expect(proceso.estado).toBe("activo");
    expect(proceso.referenciaNombre).toBe("Referencia A");
  });

  it("[COR-04] subprocesos se mapean con estado en minúsculas", () => {
    // Arrange + Act
    const [proceso] = dashboardMapper(ITEM_DASHBOARD);
    const sub = proceso.detalleSubprocesos[0];

    // Assert — el mapper hace .toLowerCase() en estado
    expect(sub.estado).toBe("en_proceso");
  });

  it("[COR-05] foto como array → se asigna directo a fotosEvidencia", () => {
    // Arrange + Act
    const [proceso] = dashboardMapper(ITEM_DASHBOARD);
    const sub = proceso.detalleSubprocesos[0];

    // Assert
    expect(sub.fotosEvidencia).toEqual(["foto1.jpg", "foto2.jpg"]);
  });

  it("[COR-06] foto como string (no array) → se envuelve en array", () => {
    // Arrange
    const fases = JSON.stringify([
      { ...JSON.parse(FASES_JSON)[0], foto: "unica.jpg" },
    ]);
    const item = { ...ITEM_DASHBOARD, fases };

    // Act
    const [proceso] = dashboardMapper(item);

    // Assert
    expect(proceso.detalleSubprocesos[0].fotosEvidencia).toEqual(["unica.jpg"]);
  });

  it("[COR-07] foto null/undefined → fotosEvidencia es array vacío", () => {
    // Arrange
    const fases = JSON.stringify([
      { ...JSON.parse(FASES_JSON)[0], foto: null },
    ]);
    const item = { ...ITEM_DASHBOARD, fases };

    // Act
    const [proceso] = dashboardMapper(item);

    // Assert
    expect(proceso.detalleSubprocesos[0].fotosEvidencia).toEqual([]);
  });

  it("[COR-08] fases ya es array (no string) → no falla", () => {
    // Arrange
    const item = { ...ITEM_DASHBOARD, fases: JSON.parse(FASES_JSON) };

    // Act + Assert
    expect(() => dashboardMapper(item)).not.toThrow();
  });

  it("[COR-09] fases null → detalleSubprocesos es array vacío", () => {
    // Arrange
    const item = { ...ITEM_DASHBOARD, fases: null };

    // Act
    const [proceso] = dashboardMapper(item);

    // Assert
    expect(proceso.detalleSubprocesos).toEqual([]);
  });

  it("[COR-10] sub_id ausente → genera id compuesto fallback", () => {
    // Arrange
    const fases = JSON.stringify([
      { ...JSON.parse(FASES_JSON)[0], sub_id: null },
    ]);
    const item = { ...ITEM_DASHBOARD, fases };

    // Act
    const [proceso] = dashboardMapper(item);

    // Assert — el mapper genera `fase-${pro_id}-${index}`
    expect(proceso.detalleSubprocesos[0].id).toBe("fase-proc-001-0");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("historialProcesosMapper › correctitud", () => {
  it("[COR-11] item único → retorna array con un Proceso", () => {
    // Arrange + Act
    const result = historialProcesosMapper(ITEM_HISTORIAL);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Proceso);
  });

  it('[COR-12] subproceso con fecha_fin → estado "finalizado"', () => {
    // Arrange + Act
    const [proceso] = historialProcesosMapper(ITEM_HISTORIAL);
    const sub = proceso.detalleSubprocesos[0];

    // Assert
    expect(sub.estado).toBe("finalizado");
  });

  it('[COR-13] subproceso sin fecha_fin → estado "en_proceso"', () => {
    // Arrange
    const item = {
      ...ITEM_HISTORIAL,
      detalle_subprocesos: [
        { ...ITEM_HISTORIAL.detalle_subprocesos[0], fecha_fin: null },
      ],
    };

    // Act
    const [proceso] = historialProcesosMapper(item);

    // Assert
    expect(proceso.detalleSubprocesos[0].estado).toBe("en_proceso");
  });

  it("[COR-14] totalAcumulado se mapea desde total_acumulado", () => {
    // Arrange + Act
    const [proceso] = historialProcesosMapper(ITEM_HISTORIAL);

    // Assert
    expect(proceso.totalAcumulado).toBe(500000);
  });

  it("[COR-15] array de items → todos se mapean", () => {
    // Arrange + Act
    const result = historialProcesosMapper([ITEM_HISTORIAL, ITEM_HISTORIAL]);

    // Assert
    expect(result).toHaveLength(2);
    result.forEach((p) => expect(p).toBeInstanceOf(Proceso));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("procesoMapper › correctitud", () => {
  it("[COR-16] row válido → retorna Proceso con todos los campos", () => {
    // Arrange + Act
    const result = procesoMapper(ROW_PROCESO);

    // Assert
    expect(result).toBeInstanceOf(Proceso);
    expect(result.id).toBe("proc-003");
    expect(result.codigoCofre).toBe("COF-003");
    expect(result.estado).toBe("en_proceso");
    expect(result.totalFases).toBe(5);
    expect(result.fasesCompletadas).toBe(2);
    expect(result.pagado).toBe(false);
  });

  it("[COR-17] fechaFin null → se preserva como null (no se convierte)", () => {
    // Arrange + Act
    const result = procesoMapper(ROW_PROCESO);

    // Assert
    expect(result.fechaFin).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Proceso entity › métodos de negocio", () => {
  it('[COR-18] estado "activo" → estaActivo() true, estaFinalizado() false', () => {
    // Arrange
    const p = new Proceso({ estado: "activo" });

    // Assert
    expect(p.estaActivo()).toBe(true);
    expect(p.estaFinalizado()).toBe(false);
  });

  it('[COR-19] estado "en_proceso" → estaActivo() true', () => {
    // Arrange
    const p = new Proceso({ estado: "en_proceso" });

    // Assert
    expect(p.estaActivo()).toBe(true);
  });

  it('[COR-20] estado "finalizado" → estaFinalizado() true, estaActivo() false', () => {
    // Arrange
    const p = new Proceso({ estado: "finalizado" });

    // Assert
    expect(p.estaFinalizado()).toBe(true);
    expect(p.estaActivo()).toBe(false);
  });

  it("[COR-21] estado null/undefined → ambos métodos retornan false", () => {
    // Arrange
    const p = new Proceso({ estado: null });

    // Assert — sin estado, no está activo ni finalizado
    expect(p.estaActivo()).toBe(false);
    expect(p.estaFinalizado()).toBe(false);
  });

  it("[COR-22] detalleSubprocesos default → array vacío si no se pasa", () => {
    // Arrange
    const p = new Proceso({ id: "x" });

    // Assert
    expect(p.detalleSubprocesos).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("mappers › rendimiento", () => {
  it("[PERF-01] dashboardMapper con 500 procesos (10 fases c/u) → < 50ms", () => {
    // Arrange
    const fases = Array.from({ length: 10 }, (_, i) => ({
      sub_id: `sub-${i}`,
      fase: `Fase ${i}`,
      orden: i,
      valor: 100000,
      fecha_inicio: "2024-01-01T08:00:00Z",
      fecha_fin: null,
      duracion: null,
      foto: [`foto-${i}.jpg`],
      estado: "En_Proceso",
      trabajador: `Trabajador ${i}`,
    }));
    const items = Array.from({ length: 500 }, (_, i) => ({
      ...ITEM_DASHBOARD,
      pro_id_proceso: `proc-${i}`,
      fases: JSON.stringify(fases),
    }));

    // Act
    const start = performance.now();
    dashboardMapper(items);
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(50);
  });

  it("[PERF-02] historialProcesosMapper con 500 registros → < 30ms", () => {
    // Arrange
    const items = Array.from({ length: 500 }, (_, i) => ({
      ...ITEM_HISTORIAL,
      pro_id_proceso: `hist-${i}`,
    }));

    // Act
    const start = performance.now();
    historialProcesosMapper(items);
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(30);
  });

  it("[PERF-03] procesoMapper con 1000 rows → < 20ms", () => {
    // Arrange
    const rows = Array.from({ length: 1000 }, (_, i) => ({
      ...ROW_PROCESO,
      pro_id_proceso: `p-${i}`,
    }));

    // Act
    const start = performance.now();
    rows.forEach(procesoMapper);
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(20);
  });

  it("[PERF-04] Proceso entity: instanciar 5000 objetos → < 20ms", () => {
    // Arrange + Act
    const start = performance.now();
    Array.from(
      { length: 5000 },
      (_, i) => new Proceso({ id: i, estado: "activo" }),
    );
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(20);
  });
});
