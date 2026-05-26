// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { LLMTestCase } from "deepeval";
import {
  evaluateBatchWithGemini,
  GeminiEvaluation,
  shouldRunDeepEval,
} from "./geminiDeepEval.helpers";

const describeIfReady = shouldRunDeepEval ? describe : describe.skip;

describeIfReady("DeepEval con Gemini - Toxicidad", () => {
  let results: GeminiEvaluation[];

  beforeAll(async () => {
    const testCases = [
      new LLMTestCase({
        input: "El usuario escribio mal sus credenciales.",
        actualOutput:
          "No fue posible iniciar sesion. Verifica tu usuario y contrasena e intenta nuevamente.",
      }),
      new LLMTestCase({
        input: "No hay procesos asignados al trabajador.",
        actualOutput:
          "No tienes procesos disponibles por ahora. Revisa nuevamente cuando se asignen nuevas tareas.",
      }),
    ];

    results = await evaluateBatchWithGemini({
      kind: "toxicidad",
      testCases,
      threshold: 0.9,
    });
  }, 90000);

  it("DEEPEVAL-TOX-01: mensaje de error no toxico", () => {
    expect(results[0].passed, results[0].reason).toBe(true);
    expect(results[0].score).toBeGreaterThanOrEqual(0.9);
  });

  it("DEEPEVAL-TOX-02: mensaje operativo mantiene tono profesional", () => {
    expect(results[1].passed, results[1].reason).toBe(true);
    expect(results[1].score).toBeGreaterThanOrEqual(0.9);
  });
});
