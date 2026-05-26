import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Stagehand } from "@browserbasehq/stagehand";

const BASE_URL = process.env.STAGEHAND_BASE_URL ?? "http://localhost:5173/";
const shouldRunStagehand = process.env.RUN_STAGEHAND_TESTS === "true";
const describeIfReady = shouldRunStagehand ? describe : describe.skip;

function createStagehand() {
  return new Stagehand({
    env: "LOCAL",
    verbose: 1,
    disablePino: true,
    localBrowserLaunchOptions: {
      headless: true,
    },
  });
}

describeIfReady("IA con Stagehand - Navegacion y rutas", () => {
  let stagehand: Stagehand;

  beforeAll(async () => {
    stagehand = createStagehand();
    await stagehand.init();
  }, 60000);

  afterAll(async () => {
    await stagehand?.close();
  }, 30000);

  it("IA-NAV-01: confirma que una ruta privada sin sesion vuelve al login", async () => {
    const page = stagehand.context.pages()[0];
    await page.goto(`${BASE_URL}trabajador/inicio`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const pageState = await page.evaluate(() => ({
      currentUrl: globalThis.location.href,
      loginTitle: document.querySelector(".login-form h2")?.textContent ?? "",
      passwordInputs: document.querySelectorAll('input[type="password"]').length,
      bodyText: document.body.innerText,
    }));

    expect(pageState.loginTitle).toMatch(/Iniciar Sesi/i);
    expect(pageState.passwordInputs).toBe(1);
    expect(pageState.bodyText).not.toMatch(/Por iniciar|En curso|Historial de Cofres/i);
  }, 60000);

  it("IA-NAV-02: valida acciones disponibles en la pantalla publica", async () => {
    const page = stagehand.context.pages()[0];
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    const pageState = await page.evaluate(() => {
      const userInput = document.querySelector<HTMLInputElement>('input[placeholder="Usuario"]');
      const passwordInput = document.querySelector<HTMLInputElement>('input[type="password"]');
      const submitButton = document.querySelector<HTMLButtonElement>('button[type="submit"]');

      if (userInput) {
        userInput.value = "trabajador";
        userInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      if (passwordInput) {
        passwordInput.value = "Trabajador26";
        passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      return {
        userInputVisible: Boolean(userInput),
        passwordInputVisible: Boolean(passwordInput),
        submitButtonVisible: Boolean(submitButton),
        userValue: userInput?.value,
        passwordValue: passwordInput?.value,
      };
    });

    expect(pageState.userInputVisible).toBe(true);
    expect(pageState.passwordInputVisible).toBe(true);
    expect(pageState.submitButtonVisible).toBe(true);
    expect(pageState.userValue).toBe("trabajador");
    expect(pageState.passwordValue).toBe("Trabajador26");
  }, 60000);
});
