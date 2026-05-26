// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { LLMTestCase } from "deepeval";
import {
  evaluateBatchWithGemini,
  GeminiEvaluation,
  shouldRunDeepEval,
} from "./geminiDeepEval.helpers";

const describeIfReady = shouldRunDeepEval ? describe : describe.skip;

describeIfReady("DeepEval con Gemini - RAG", () => {
  let results: GeminiEvaluation[];

  beforeAll(async () => {
    const testCases = [
      new LLMTestCase({
        input: "Que rutas puede usar el rol trabajador?",
        actualOutput:
          "El trabajador puede entrar a /trabajador/inicio y /trabajador/historial, pero no a rutas de gerente.",
        retrievalContext: [
          "Las rutas de trabajador son /trabajador/inicio y /trabajador/historial.",
          "Las rutas /gerente, /gerente/empleados y /gerente/tarifas requieren rol gerente.",
        ],
      }),
      new LLMTestCase({
        input: "Que muestra el historial del trabajador cuando no hay registros?",
        actualOutput:
          "Cuando no hay registros pendientes, la pantalla debe mostrar un mensaje indicando que no hay registros pendientes.",
        retrievalContext: [
          "La vista Historial Trabajador consulta vw_historial_subprocesos_pendientes.",
          "Si la respuesta de historial esta vacia, se muestra el texto No hay registros pendientes.",
        ],
      }),
    ];

    results = await evaluateBatchWithGemini({ kind: "rag", testCases });
  }, 90000);

  it("DEEPEVAL-RAG-01: respuesta soportada por contexto de roles", () => {
    expect(results[0].passed, results[0].reason).toBe(true);
    expect(results[0].score).toBeGreaterThanOrEqual(0.75);
  });

  it("DEEPEVAL-RAG-02: respuesta soportada por contexto de historial", () => {
    expect(results[1].passed, results[1].reason).toBe(true);
    expect(results[1].score).toBeGreaterThanOrEqual(0.75);
  });
});
