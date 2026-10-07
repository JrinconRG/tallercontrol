import { useState, useMemo } from "react";
import { useGetProcesosSinAsignar } from "./useObtenerProcesosSinAsignar";
import { useObtenerClientes } from "../../../clientes/application/hooks/useObtenerClientes";
import { useAsignarPedido } from "../../../pedido/application/hooks/useAsignarPedido";
import { usePagination } from "../../../../hooks/usePagination";
import { useAuthStore } from "../../../../stores/authStore";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";

export const useProcesosTerminadosUI = () => {
  const [search, setSearch] = useState("");
  const [selectedReference, setSelectedReference] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const { showSuccess, showError } = useToast();

  const user = useAuthStore((state) => state.user);

  // Queries & Mutations
  const {
    procesosSinAsignar,
    loading: loadingProcesos,
    error: errorProcesos,
    errorMessage,
  } = useGetProcesosSinAsignar();

  const {
    clientes = [],
    loading: loadingClientes,
    error: errorClientes,
    errorMessage: errorMessageClientes,
  } = useObtenerClientes();

  const { mutateAsync: asignarPedido, isPending: asignando } =
    useAsignarPedido();

  // Opciones Memoizadas
  const opcionesClientes = useMemo(() => {
    return clientes.map((c) => ({ value: c.id, label: c.nombre }));
  }, [clientes]);

  const opcionesReferencias = useMemo(() => {
    const referencias = procesosSinAsignar.map((p) =>
      p.referenciaNombre?.trim(),
    );
    return [...new Set(referencias)]
      .filter(Boolean)
      .map((ref) => ({ value: ref, label: ref }));
  }, [procesosSinAsignar]);

  // Filtrado
  const datosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return procesosSinAsignar.filter((p) => {
      const matchSearch =
        !term ||
        (p.codigoCofre || "").toLowerCase().includes(term) ||
        (p.referenciaNombre || "").toLowerCase().includes(term);
      const matchReference = selectedReference
        ? p.referenciaNombre?.trim() === selectedReference.trim()
        : true;
      return matchSearch && matchReference;
    });
  }, [procesosSinAsignar, search, selectedReference]);

  // Paginación
  const pagination = usePagination(datosFiltrados, 10);
  const idsPagina = pagination.paginatedData.map((p) => p.id);

  // Selección
  const todosSeleccionadosEnPagina =
    idsPagina.length > 0 && idsPagina.every((id) => seleccionados.includes(id));

  const toggleSeleccionado = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleSeleccionarPagina = () => {
    setSeleccionados((prev) => {
      if (todosSeleccionadosEnPagina) {
        return prev.filter((id) => !idsPagina.includes(id));
      }
      const nuevos = idsPagina.filter((id) => !prev.includes(id));
      return [...prev, ...nuevos];
    });
  };

  const limpiarSeleccion = () => setSeleccionados([]);

  const limpiarFiltros = () => {
    setSearch("");
    setSelectedReference("");
    pagination.resetPage();
  };

  // Acción principal
  const handleAsignar = async () => {
    if (!selectedCliente) return;

    try {
      await asignarPedido({
        clienteId: Number(selectedCliente),
        procesoIds: seleccionados,
        creadoPor: user?.id,
      });
      const cliente = clientes.find(
        (item) => String(item.id) === String(selectedCliente),
      );
      showSuccess(
        "Pedido creado",
        `${seleccionados.length} cofre${seleccionados.length !== 1 ? "s" : ""} asignado${seleccionados.length !== 1 ? "s" : ""} a ${cliente?.nombre ?? "el cliente seleccionado"}.`,
      );
      limpiarSeleccion();
      setSelectedCliente("");
    } catch (err) {
      showError("No se pudo crear el pedido", getAppErrorMessage(err));
    }
  };

  return {
    state: {
      search,
      selectedReference,
      seleccionados,
      selectedCliente,
      datosFiltrados,
      datosPaginados: pagination.paginatedData,
      opcionesClientes,
      opcionesReferencias,
      todosSeleccionadosEnPagina,
      hayFiltrosActivos: Boolean(search || selectedReference),
      loading: loadingProcesos || loadingClientes,
      error: errorProcesos || errorClientes,
      errorMessage: errorMessage || errorMessageClientes,
      asignando,
      pagination,
    },
    actions: {
      setSearch,
      setSelectedReference,
      setSelectedCliente,
      toggleSeleccionado,
      toggleSeleccionarPagina,
      limpiarSeleccion,
      limpiarFiltros,
      handleAsignar,
    },
  };
};
