import {
  act,
  cleanup,
  configure,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ToastProvider, useToast } from "./useToast";

configure({
  asyncWrapper: async (callback) => {
    const resultado = await callback();
    if (vi.isFakeTimers()) {
      act(() => vi.advanceTimersByTime(0));
    }
    return resultado;
  },
});

let api;
let consumerRenders;

function ConsumidorToast() {
  api = useToast();
  consumerRenders += 1;

  return (
    <div>
      <button
        onClick={() =>
          api.showToast({
            title: "General",
            message: "Mensaje general",
            type: "created",
            size: "large",
            duration: 7_000,
          })
        }
      >
        Mostrar general
      </button>
      <button
        onClick={() =>
          api.showSuccess("Éxito", "Mensaje de éxito", {
            size: "large",
            duration: 7_000,
          })
        }
      >
        Mostrar éxito
      </button>
      <button onClick={() => api.showError("Error", "Mensaje de error")}>
        Mostrar error
      </button>
      <button onClick={() => api.showInfo("Información", "Mensaje informativo")}>
        Mostrar información
      </button>
      <button
        onClick={() =>
          api.showToast({
            title: "Toast predeterminado",
            message: "Duración predeterminada",
          })
        }
      >
        Mostrar predeterminado
      </button>
    </div>
  );
}

function renderToast() {
  const user = userEvent.setup({
    advanceTimers: (milliseconds) => vi.advanceTimersByTime(milliseconds),
  });
  const result = render(
    <ToastProvider>
      <ConsumidorToast />
    </ToastProvider>,
  );
  return { ...result, user };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-08T05:04:56Z"));
  api = undefined;
  consumerRenders = 0;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ToastProvider y useToast", () => {
  it("lanza un error claro si useToast se usa fuera del provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    function ConsumidorSinProvider() {
      useToast();
      return null;
    }

    expect(() => render(<ConsumidorSinProvider />)).toThrow(
      "useToast debe usarse dentro de ToastProvider.",
    );
    consoleError.mockRestore();
  });

  it("muestra título y mensaje desde showToast y los métodos abreviados", async () => {
    const { user } = renderToast();

    await user.click(screen.getByRole("button", { name: "Mostrar general" }));
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Mensaje general")).toBeInTheDocument();
    const general = screen.getByRole("status");
    expect(general).toHaveClass(
      "toast--created",
      "toast--large",
    );
    expect(general.querySelector(".toast-timer-bar")).toHaveStyle({
      animationDuration: "7000ms",
    });

    await user.click(screen.getByRole("button", { name: "Mostrar éxito" }));
    expect(screen.getByText("Éxito")).toBeInTheDocument();
    expect(screen.getByText("Mensaje de éxito")).toBeInTheDocument();
    const exito = screen.getByText("Mensaje de éxito").closest(".toast");
    expect(exito).toHaveClass("toast--large");
    expect(exito.querySelector(".toast-timer-bar")).toHaveStyle({
      animationDuration: "7000ms",
    });

    await user.click(screen.getByRole("button", { name: "Mostrar error" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Mensaje de error");

    await user.click(
      screen.getByRole("button", { name: "Mostrar información" }),
    );
    expect(screen.getByText("Información")).toBeInTheDocument();
    expect(screen.getByText("Mensaje informativo")).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(2);
  });

  it.each(["success", "error", "info", "created", "started", "completed"])(
    "aplica la clase y rol correspondientes al tipo %s",
    (_tipo) => {
      renderToast();
      act(() => {
        api.showToast({
          title: "Tipo",
          message: _tipo,
          type: _tipo,
          duration: null,
        });
      });

      const toast = screen.getByText(_tipo).closest(".toast");
      expect(toast).toHaveClass(`toast--${_tipo}`);
      expect(toast).toHaveAttribute(
        "role",
        _tipo === "error" ? "alert" : "status",
      );
    },
  );

  it("usa info para un tipo desconocido", () => {
    renderToast();
    act(() => {
      api.showToast({
        title: "Desconocido",
        message: "Sin tipo reconocido",
        type: "otro",
        duration: null,
      });
    });

    expect(screen.getByRole("status")).toHaveClass("toast--info");
  });

  it("conserva el toast predeterminado hasta 5999 ms y lo cierra a los 6000 ms", async () => {
    const { user } = renderToast();
    await user.click(
      screen.getByRole("button", { name: "Mostrar predeterminado" }),
    );

    act(() => vi.advanceTimersByTime(5_999));
    expect(screen.getByText("Duración predeterminada")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(
      screen.queryByText("Duración predeterminada"),
    ).not.toBeInTheDocument();
  });

  it("mantiene un toast large por 9000 ms", () => {
    renderToast();
    act(() =>
      api.showToast({ title: "Grande", message: "Largo", size: "large" }),
    );

    act(() => vi.advanceTimersByTime(8_999));
    expect(screen.getByText("Largo")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Largo")).not.toBeInTheDocument();
  });

  it("mantiene los errores hasta que se descartan manualmente", async () => {
    const { user } = renderToast();
    await user.click(screen.getByRole("button", { name: "Mostrar error" }));

    expect(screen.getByRole("alert").querySelector(".toast-timer")).toBeNull();
    act(() => vi.advanceTimersByTime(20_000));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("permite que duration explícita sustituya la duración automática", () => {
    renderToast();
    act(() =>
      api.showToast({
        title: "Expreso",
        message: "Duración explícita",
        duration: 2_500,
      }),
    );

    act(() => vi.advanceTimersByTime(2_499));
    expect(screen.getByText("Duración explícita")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(
      screen.queryByText("Duración explícita"),
    ).not.toBeInTheDocument();
  });

  it.each([null, -1])("mantiene duration %s de forma persistente", (duration) => {
    renderToast();
    act(() =>
      api.showToast({
        title: "Persistente",
        message: `Duración ${duration}`,
        duration,
      }),
    );

    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByText(`Duración ${duration}`)).toBeInTheDocument();
  });

  it("pausa al pasar el puntero y continúa con el tiempo restante", async () => {
    const { user } = renderToast();
    act(() =>
      api.showToast({ title: "Pausado", message: "Hover", duration: 6_000 }),
    );
    const toast = screen.getByRole("status");

    act(() => vi.advanceTimersByTime(2_000));
    await user.hover(toast);
    expect(toast.querySelector(".toast-timer-bar")).toHaveStyle({
      animationPlayState: "paused",
    });
    act(() => vi.advanceTimersByTime(5_000));
    expect(screen.getByText("Hover")).toBeInTheDocument();

    await user.unhover(toast);
    act(() => vi.advanceTimersByTime(3_999));
    expect(screen.getByText("Hover")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Hover")).not.toBeInTheDocument();
  });

  it("pausa al enfocar el botón cerrar y reanuda el tiempo restante", async () => {
    const { user } = renderToast();
    act(() =>
      api.showToast({ title: "En foco", message: "Foco", duration: 6_000 }),
    );
    const cerrar = screen.getByRole("button", { name: "Cerrar notificación" });

    act(() => vi.advanceTimersByTime(2_000));
    for (let i = 0; i < 6; i += 1) {
      await user.tab();
    }
    expect(cerrar).toHaveFocus();
    expect(
      screen.getByRole("status").querySelector(".toast-timer-bar"),
    ).toHaveStyle({ animationPlayState: "paused" });
    act(() => vi.advanceTimersByTime(5_000));
    expect(screen.getByText("Foco")).toBeInTheDocument();

    await user.tab();
    act(() => vi.advanceTimersByTime(3_999));
    expect(screen.getByText("Foco")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Foco")).not.toBeInTheDocument();
  });

  it("cierra desde el botón accesible o mediante dismissToast con el id retornado", async () => {
    const { user } = renderToast();
    await user.click(screen.getByRole("button", { name: "Mostrar general" }));
    const toast = screen.getByRole("status");
    expect(
      within(toast).getByRole("button", { name: "Cerrar notificación" }),
    ).toBeInTheDocument();
    await user.click(
      within(toast).getByRole("button", { name: "Cerrar notificación" }),
    );
    expect(screen.queryByText("Mensaje general")).not.toBeInTheDocument();

    let id;
    act(() => {
      id = api.showToast({
        title: "Por id",
        message: "Cerrar por id",
        duration: null,
      });
    });
    act(() => api.dismissToast(id));
    expect(screen.queryByText("Cerrar por id")).not.toBeInTheDocument();
  });

  it("al mostrar un cuarto toast elimina el más antiguo", () => {
    renderToast();
    act(() => {
      for (let i = 1; i <= 4; i += 1) {
        api.showToast({
          title: `Toast ${i}`,
          message: `Mensaje ${i}`,
          duration: null,
        });
      }
    });

    expect(screen.queryByText("Mensaje 1")).not.toBeInTheDocument();
    expect(screen.getByText("Mensaje 2")).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(3);
  });

  it("no duplica toasts con igual tipo, título y mensaje", () => {
    renderToast();
    act(() => {
      api.showToast({
        title: "Duplicado",
        message: "Mismo contenido",
        type: "info",
        duration: null,
      });
      api.showToast({
        title: "Duplicado",
        message: "Mismo contenido",
        type: "info",
        duration: null,
      });
    });

    expect(screen.getAllByText("Mismo contenido")).toHaveLength(1);
  });

  it("mantiene estable el contexto y no re-renderiza al agregar o cerrar toasts", () => {
    renderToast();
    const rendersIniciales = consumerRenders;
    let id;

    act(() => {
      id = api.showToast({
        title: "Contexto",
        message: "Estable",
        duration: null,
      });
    });
    expect(consumerRenders).toBe(rendersIniciales);

    act(() => api.dismissToast(id));
    expect(consumerRenders).toBe(rendersIniciales);
  });
});
