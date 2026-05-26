// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { LLMTestCase } from "deepeval";
import {
  evaluateBatchWithGemini,
  GeminiEvaluation,
  shouldRunDeepEval,
} from "./geminiDeepEval.helpers";

const describeIfReady = shouldRunDeepEval ? describe : describe.skip;

describeIfReady("DeepEval con Gemini - Correccion", () => {
  let results: GeminiEvaluation[];

  beforeAll(async () => {
    const testCases = [
      new LLMTestCase({
      input: "Que ocurre si un trabajador intenta entrar a rutas de gerente?",
      expectedOutput:
        "El sistema debe impedir el acceso y redirigir al trabajador fuera de la ruta de gerente.",
      actualOutput:
        "Un trabajador no puede entrar a las rutas de gerente; la aplicacion lo redirige a una pantalla autorizada o al login.",
      }),
      new LLMTestCase({
        input: "Que debe pasar si el usuario envia el login sin usuario ni contrasena?",
        expectedOutput:
          "El sistema debe bloquear el inicio de sesion y no debe crear una sesion autenticada.",
        actualOutput:
          "Si los campos estan vacios, el formulario no inicia sesion, mantiene al usuario en login y no guarda estado autenticado.",
      }),
    ];

    results = await evaluateBatchWithGemini({ kind: "correccion", testCases });
  }, 90000);

  it("DEEPEVAL-COR-01: respuesta correcta sobre acceso de trabajador", () => {
    expect(results[0].passed, results[0].reason).toBe(true);
    expect(results[0].score).toBeGreaterThanOrEqual(0.75);
  });

  it("DEEPEVAL-COR-02: respuesta correcta sobre validacion del login", () => {
    expect(results[1].passed, results[1].reason).toBe(true);
    expect(results[1].score).toBeGreaterThanOrEqual(0.75);
  });
});
