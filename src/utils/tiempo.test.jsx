import { calcularDuracion } from "./tiempo";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import process from "node:process";

const AHORA = new Date("2026-11-08T05:04:56.248Z");
const INICIO = "2026-11-08T05:04:56.248Z";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(AHORA);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("calcularDuracion", () => {
  it.each([
    ["0 segundos", 0, "0 min"],
    ["59 segundos", 59_000, "0 min"],
    ["un minuto", 60_000, "1 min"],
    ["59 minutos", 59 * 60_000, "59 min"],
    ["una hora", 60 * 60_000, "1h 0min"],
    ["23 horas y 59 minutos", (23 * 60 + 59) * 60_000, "23h 59min"],
    ["24 horas", 24 * 60 * 60_000, "1d 0h"],
    ["varios días", (3 * 24 + 5) * 60 * 60_000, "3d 5h"],
  ])("con %s conserva el formato actual", (_caso, transcurrido, esperado) => {
    vi.setSystemTime(AHORA.getTime() + transcurrido);

    expect(calcularDuracion(INICIO)).toBe(esperado);
  });

  it.each([
    ["Z", "2026-11-08T05:04:56Z"],
    ["offset +00:00", "2026-11-08T05:04:56+00:00"],
    ["microsegundos", "2026-11-08T05:04:56.24852+00:00"],
  ])("acepta fecha ISO con %s", (_caso, fecha) => {
    expect(calcularDuracion(fecha)).not.toBe("Fecha inválida");
  });

  it.fails("acepta fecha válida de PostgreSQL con espacio y offset +00", () => {
    expect(calcularDuracion("2026-11-08 05:04:56+00")).not.toBe(
      "Fecha inválida",
    );
  });

  it.each([null, undefined, ""])("representa %s como no iniciado", (fecha) => {
    expect(calcularDuracion(fecha)).toBe("Sin Iniciar");
  });

  it("devuelve el texto de respaldo para texto no interpretable", () => {
    expect(calcularDuracion("esto no es una fecha")).toBe("Fecha inválida");
  });

  it.fails("rechaza un número en vez de interpretarlo como una fecha textual", () => {
    expect(calcularDuracion(42)).toBe("Fecha inválida");
  });

  it("no muestra duración negativa si el reloj de la tablet está atrasado", () => {
    vi.setSystemTime(new Date("2026-11-07T05:04:56.248Z"));

    const resultado = calcularDuracion(INICIO);

    expect(resultado).toBe("0 min");
    expect(resultado).not.toMatch(/-|NaN/);
  });

  it.each([
    ["un segundo", 1_000],
    ["un minuto", 60_000],
    ["una hora", 60 * 60_000],
    ["un día", 24 * 60 * 60_000],
  ])("no reduce la duración al avanzar %s", (_salto, salto) => {
    const antes = calcularDuracion(INICIO);
    vi.setSystemTime(AHORA.getTime() + salto);
    const despues = calcularDuracion(INICIO);

    expect(duracionEnMinutos(despues)).toBeGreaterThanOrEqual(
      duracionEnMinutos(antes),
    );
  });

  it("calcula igual con TZ=UTC que con TZ=America/Bogota", () => {
    const duracionEnBogota = calcularDuracion("2026-11-08T04:04:56Z");
    let duracionEnUtc;
    try {
      process.env.TZ = "UTC";
      duracionEnUtc = calcularDuracion("2026-11-08T04:04:56Z");
    } finally {
      process.env.TZ = "America/Bogota";
    }

    expect(duracionEnUtc).toBe(duracionEnBogota);
  });
});

function duracionEnMinutos(valor) {
  const [dias, horas, minutos] = [
    valor.match(/(\d+)d/),
    valor.match(/(\d+)h/),
    valor.match(/(\d+)min/),
  ];

  return (
    Number(dias?.[1] ?? 0) * 24 * 60 +
    Number(horas?.[1] ?? 0) * 60 +
    Number(minutos?.[1] ?? 0)
  );
}
