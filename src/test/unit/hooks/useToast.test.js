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

  test("useToast - showToast respeta el type y duration", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    // Act
    act(() => {
      result.current.showToast({
        message: "salio mal",
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
      result.current.showToast({ message: "nada  q elimina", duration: 3000 });
    });

    // Act
    act(() => {
      vi.advanceTimersByTime(2999);
    });

    // Assert
    expect(result.current.toasts).toHaveLength(1);
  });

  test("useToast - se apilan en orden de llegada", () => {
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

  test("useToast - solo se elimina el toast cuyo tiempo acabo", () => {
    // Arrange
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(2000);

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

  test("useToast - lista vacia cuando se acabo el tiempo", () => {
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

  test("useToast - duration 0 descarta el toast de forma inmediata", () => {
    // Arrange
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ message: "Flash", duration: 0 });
    });

    // Act
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Assert
    expect(result.current.toasts).toEqual([]);
  });

  test("useToast - showToast mantiene la misma referencia entre re-renders", () => {
    // Arrange
    const { result, rerender } = renderHook(() => useToast());
    const refAntes = result.current.showToast;

    // Act
    rerender();

    // Assert
    expect(result.current.showToast).toBe(refAntes);
  });
});
