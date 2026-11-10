import {
  act,
  cleanup,
  configure,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "../../hooks/useToast";

configure({
  asyncWrapper: async (callback) => {
    const resultado = await callback();
    if (vi.isFakeTimers()) {
      act(() => vi.advanceTimersByTime(0));
    }
    return resultado;
  },
});

function EmisorToast() {
  const { showToast } = useToast();

  return (
    <button
      onClick={() =>
        showToast({
          title: "Subproceso iniciado",
          message: "El trabajo quedó registrado",
          type: "started",
          duration: null,
        })
      }
    >
      Iniciar subproceso
    </button>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-08T05:04:56Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Toast", () => {
  it("presenta notificaciones accesibles emitidas desde ToastProvider", async () => {
    const user = userEvent.setup({
      advanceTimers: (milliseconds) => vi.advanceTimersByTime(milliseconds),
    });
    render(
      <ToastProvider>
        <EmisorToast />
      </ToastProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Iniciar subproceso" }),
    );

    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("toast--started");
    expect(toast).toHaveTextContent("Subproceso iniciado");
    expect(toast).toHaveTextContent("El trabajo quedó registrado");
    expect(
      screen.getByRole("button", { name: "Cerrar notificación" }),
    ).toBeInTheDocument();
  });
});
