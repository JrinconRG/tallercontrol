// @vitest-environment node
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

describeIfReady("IA con Stagehand - Login", () => {
  let stagehand: Stagehand;

  beforeAll(async () => {
    stagehand = createStagehand();
    await stagehand.init();
  }, 60000);

  afterAll(async () => {
    await stagehand?.close();
  }, 30000);

  it("IA-LOGIN-01: reconoce los elementos principales del formulario", async () => {
    const page = stagehand.context.pages()[0];
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    const formState = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(".input-login"));
      const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
      return {
        titleText: document.querySelector(".login-form h2")?.textContent ?? "",
        inputsCount: inputs.length,
        userPlaceholder: inputs[0]?.getAttribute("placeholder"),
        passwordType: inputs[1]?.getAttribute("type"),
        buttonText: button?.textContent ?? "",
      };
    });

    expect(formState.titleText).toMatch(/Iniciar Sesi/i);
    expect(formState.inputsCount).toBe(2);
    expect(formState.userPlaceholder).toBe("Usuario");
    expect(formState.passwordType).toBe("password");
    expect(formState.buttonText).toMatch(/Iniciar Sesi/i);
  }, 60000);

  it("IA-LOGIN-02: bloquea el envio cuando se intenta iniciar sesion sin datos", async () => {
    const page = stagehand.context.pages()[0];
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    });
    await page.waitForTimeout(500);

    const blockedState = await page.evaluate(() => ({
      bodyText: document.body.innerText,
      currentUrl: globalThis.location.href,
      authState: globalThis.localStorage.getItem("tallercontrol-auth"),
      userValue:
        document.querySelector<HTMLInputElement>('input[placeholder="Usuario"]')?.value ?? "",
      passwordValue:
        document.querySelector<HTMLInputElement>('input[type="password"]')?.value ?? "",
    }));

    expect(blockedState.bodyText).toMatch(/Iniciar Sesi/i);
    expect(blockedState.currentUrl).toBe(BASE_URL);
    expect(blockedState.authState).toBeNull();
    expect(blockedState.userValue).toBe("");
    expect(blockedState.passwordValue).toBe("");
  }, 60000);
});
