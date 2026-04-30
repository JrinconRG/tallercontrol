import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropTypes from "prop-types";
import { useCrearTrabajador } from "../../../features/Trabajadores/application/hooks/useCrearEmpleado";

import { useInformacionEmpleados } from "../../../features/Trabajadores/application/hooks/useInformacionEmpleados";

import { useTrabajadoresPorCargo } from "../../../features/Trabajadores/application/hooks/useTrabajadoresPorCargo";

import { useTrabajadoresSelect } from "../../../features/Trabajadores/application/hooks/useTrabajadoresSelect";
import { trabajadorRepository } from "../../../features/Trabajadores/infrastructure/trabajadorRepository";

// --- TEST DOUBLES (Mocks) ---
vi.mock(
  "../../../features/Trabajadores/infrastructure/trabajadorRepository",
  () => ({
    trabajadorRepository: {
      createEmpleado: vi.fn(),
      getInfoEmpleados: vi.fn(),
      getTrabajadoresPorCargo: vi.fn(),
      getTrabajadorSelect: vi.fn(),
    },
  }),
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };
  return { Wrapper, queryClient };
};

describe("Hooks de Dominio: Trabajador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useCrearEmpleado", () => {
    it("Debe crear un empleado e invalidar la query de infromacion", async () => {
      const { Wrapper, queryClient } = createWrapper();
      const nuevoEmpleado = { nombre: "Juana", cargoId: 1 };
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      vi.mocked(trabajadorRepository.createEmpleado).mockResolvedValue({
        id: 99,
      });

      const { result } = renderHook(() => useCrearTrabajador(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync(nuevoEmpleado);

      expect(trabajadorRepository.createEmpleado).toHaveBeenCalledWith(
        nuevoEmpleado,
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["informacion-empleados"],
      });
    });
  });

  describe("useInformacionEmpleados", () => {
    it("Debe retornar la lista de empleados completa", async () => {
      const mockData = [{ id: 1, nombre: "Empleado Test", cargo: "QA" }];
      vi.mocked(trabajadorRepository.getInfoEmpleados).mockResolvedValue(
        mockData,
      );

      const { result } = renderHook(() => useInformacionEmpleados(), {
        wrapper: createWrapper().Wrapper,
      });

      await waitFor(() => expect(result.current.loading).to.be.false);

      expect(result.current.empleados).to.be.an("array").with.lengthOf(1);
      expect(result.current.empleados[0].nombre).to.equal("Empleado Test");
      expect(result.current.error).to.be.null;
    });

    it("Debe manejar el error de carga con un mensaje por defecto", async () => {
      vi.mocked(trabajadorRepository.getInfoEmpleados).mockRejectedValue(
        new Error("DB_ERROR"),
      );

      const { result } = renderHook(() => useInformacionEmpleados(), {
        wrapper: createWrapper().Wrapper,
      });

      await waitFor(() => expect(result.current.loading).to.be.false);
      expect(result.current.errorMessage).to.equal("DB_ERROR");
      expect(result.current.empleados).to.deep.equal([]);
    });
  });

  describe("useTrabajadoresPorCargo", () => {
    it("Debe filtrar trabajadores por cargoId cuando es válido", async () => {
      const cargoId = 5;
      const mockData = [{ id: 10, nombre: "Especialista" }];
      vi.mocked(trabajadorRepository.getTrabajadoresPorCargo).mockResolvedValue(
        mockData,
      );

      const { result } = renderHook(() => useTrabajadoresPorCargo(cargoId), {
        wrapper: createWrapper().Wrapper,
      });

      await waitFor(() => expect(result.current.loading).to.be.false);

      expect(trabajadorRepository.getTrabajadoresPorCargo).toHaveBeenCalledWith(
        cargoId,
      );
      expect(result.current.trabajadoresPorCargo).to.have.lengthOf(1);
    });

    it("No debe disparar la consulta si cargoId es null", () => {
      const { result } = renderHook(() => useTrabajadoresPorCargo(null), {
        wrapper: createWrapper().Wrapper,
      });

      expect(result.current.loading).to.be.false;
      expect(
        trabajadorRepository.getTrabajadoresPorCargo,
      ).not.toHaveBeenCalled();
    });
  });

  describe("useTrabajadoresSelect", () => {
    it("Debe retornar datos simplificados para componentes select", async () => {
      const mockSelect = [{ value: 1, label: "Juana Rincon" }];
      vi.mocked(trabajadorRepository.getTrabajadorSelect).mockResolvedValue(
        mockSelect,
      );

      const { result } = renderHook(() => useTrabajadoresSelect(), {
        wrapper: createWrapper().Wrapper,
      });

      await waitFor(() => expect(result.current.loading).to.be.false);

      expect(result.current.trabajadoresSelect).to.deep.equal(mockSelect);
      expect(result.current.refetch).to.be.a("function");
    });
  });
});
