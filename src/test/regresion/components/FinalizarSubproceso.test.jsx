import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, vi, test } from "vitest";
import FinalizarSubproceso from "../../../pages/Trabajador/InicioTrabajador/funciones/FinalizarSubproceso";
import * as storageService from "../../../services/storage";

import { useFinalizarSubProceso } from "../../../features/subProcesos/application/hooks/useFinalizarSubProceso";

vi.mock(
  "../../../features/subProcesos/application/hooks/useFinalizarSubProceso",
);

vi.mock("../../../services/storage.js", () => ({
  subirEvidencia: vi.fn(),
}));

// Mock global para URL
globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-url");

// Helper para datos de prueba
const crearSubprocesoMock = (esUltimaFase = false) => ({
  subproceso: {
    id: "123",
    rc_nombre: "Imperial",
    id_nombre_proceso: "CF-043",
    nombre_fase: "Pulidor",
    sub_id_subproceso: "SP-99",
    esUltimaFase,
  },
});

describe("Test caja blanca - FinalizarSubproceso Componente", () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuración del Test Double para el hook de aplicación
    useFinalizarSubProceso.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    storageService.subirEvidencia.mockResolvedValue(undefined);
  });

  test("CP-1.1: Debe llamar onSuccess con tipo 'finalizado' cuando es la iltima fase", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const subproceso = crearSubprocesoMock(true);

    mockMutateAsync.mockResolvedValue({ success: true });

    render(
      <FinalizarSubproceso
        subproceso={subproceso}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    // Simular carga de archivo
    const input = screen.getByLabelText(/Subir evidencia/i);
    const archivoFalso = new File(["foto"], "evidencia.png", {
      type: "image/png",
    });
    fireEvent.change(input, { target: { files: [archivoFalso] } });

    fireEvent.click(screen.getByRole("button", { name: /Finalizar/i }));

    await waitFor(() => {
      expect(storageService.subirEvidencia).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: "finalizado" }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  test("CP-1.3: Debe mostrar error y no llamar al servicio si no hay archivo", async () => {
    render(
      <FinalizarSubproceso
        subproceso={crearSubprocesoMock()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Finalizar/i }));

    expect(
      await screen.findByText(/Por favor, selecciona una foto de evidencia/i),
    ).toBeInTheDocument();
    expect(storageService.subirEvidencia).not.toHaveBeenCalled();
  });

  test("CP-1.4: Debe manejar el error sin crashear si subirEvidencia falla", async () => {
    const onSuccess = vi.fn();
    storageService.subirEvidencia.mockRejectedValue(
      new Error("Firebase Error"),
    );

    // Espiamos console.error para verificar que se captura el error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <FinalizarSubproceso
        subproceso={crearSubprocesoMock()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    );

    const input = screen.getByLabelText(/Subir evidencia/i);
    fireEvent.change(input, {
      target: { files: [new File([""], "test.jpg")] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Finalizar/i }));

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      expect(
        screen.getByText(/Hubo un error al procesar la solicitud/i),
      ).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  test("CP-1.5: Debe manejar el error del hook mutateAsync", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Error backend"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <FinalizarSubproceso
        subproceso={crearSubprocesoMock()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    const input = screen.getByLabelText(/Subir evidencia/i);
    fireEvent.change(input, {
      target: { files: [new File([""], "test.jpg")] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Finalizar/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(
        screen.getByText(/Hubo un error al procesar la solicitud/i),
      ).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });
});
