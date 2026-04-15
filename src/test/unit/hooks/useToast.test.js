import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, vi } from "vitest";
import { useToast } from "../../../hooks/useToast";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("Test hook useToast", () => {
  test("useToast - Estado inicial: lista de toasts vacía", () => {
    // Arrange & Act
    //  montar el hook
    const { result } = renderHook(() => useToast());

    // Assert
    //no debe haver nada
    expect(result.current.toasts).toEqual([]);
  });

  test("useToast - showToast agrega un toast con type 'success' por defecto", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    // Act
    act(() => {
      result.current.showToast({ message: "Guardado correctamente" });
    });

    // Assert
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Guardado correctamente");
    expect(result.current.toasts[0].type).toBe("success");
  });

  test("useToast - showToast respeta el type y duration cuando se pasan explícitamente", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    // Act
    act(() => {
      result.current.showToast({
        message: "Algo salió mal",
        type: "error",
        duration: 5000,
      });
    });

    // Assert
    expect(result.current.toasts[0].type).toBe("error");
    expect(result.current.toasts).toHaveLength(1);
  });

  test("useToast - el toast se elimina al cumplirse la duracion", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ message: "Hola", duration: 3000 });
    });

    // Act
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Assert
    expect(result.current.toasts).toEqual([]);
  });

  test("useToast - el toast NO se elimina antes de que pase la duration", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ message: "Todavía aquí", duration: 3000 });
    });

    // Act
    act(() => {
      vi.advanceTimersByTime(2999);
    });

    // Assert
    expect(result.current.toasts).toHaveLength(1);
  });

  test("useToast - varios showToast apilan los toasts en orden de inserción", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    // Act
    act(() => {
      result.current.showToast({ message: "Primero" });
      result.current.showToast({ message: "Segundo" });
      result.current.showToast({ message: "Tercero" });
    });

    // Assert
    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts.map((t) => t.message)).toEqual([
      "Primero",
      "Segundo",
      "Tercero",
    ]);
  });

  // ── Solo se elimina el toast correcto ──────────────────────

  test("useToast - solo se elimina el toast cuyo timer venció, no los demás", () => {
    // Arrange
    vi.spyOn(Date, "now")
      .mockReturnValueOnce(1000) // id del toast "Corto"
      .mockReturnValueOnce(2000); // id del toast "Largo"

    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ message: "Corto", duration: 1000 });
      result.current.showToast({ message: "Largo", duration: 5000 });
    });

    // Act
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Assert
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Largo");
  });

  // ── runAllTimers elimina todos ─────────────────────────────

  test("useToast - después de que vencen todos los timers la lista queda vacía", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ message: "A", duration: 1000 });
      result.current.showToast({ message: "B", duration: 2000 });
      result.current.showToast({ message: "C", duration: 3000 });
    });

    // Act
    act(() => {
      vi.runAllTimers();
    });

    // Assert
    expect(result.current.toasts).toEqual([]);
  });

  // ── Duration 0 ms ──────────────────────────────────────────

  test("useToast - duration 0 descarta el toast de forma inmediata", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ message: "Flash", duration: 0 });
    });

    // Act
    // Avanzamos 0 ms: suficiente para que un setTimeout(fn, 0) dispare
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Assert
    expect(result.current.toasts).toEqual([]);
  });

  // ── showToast es una referencia estable (useCallback) ──────

  test("useToast - showToast mantiene la misma referencia entre re-renders", () => {
    // Arrange
    const { result, rerender } = renderHook(() => useToast());
    const refAntes = result.current.showToast;

    // Act
    rerender();

    // Assert
    // useCallback garantiza que la función no se recrea innecesariamente
    expect(result.current.showToast).toBe(refAntes);
  });
});
