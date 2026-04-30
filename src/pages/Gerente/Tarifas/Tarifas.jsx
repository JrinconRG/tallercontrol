import { detectarCambios } from "../../../utils/construirMatrizTarifas";
import { useObtenerTarifas } from "../../../features/tarifas/application/hooks/useObtenerTarifas";
import { useGuardarTarifas } from "../../../features/tarifas/application/hooks/useGuardarTarifas";
import { useTrabajadoresSelect } from "../../../features/Trabajadores/application/hooks/useTrabajadoresSelect";
import Table from "../../../components/Table/Table";
import TableHeader from "../../../components/Table/TableHeader";
import Card from "../../../components/card/Card";
import "./Tarifas.css";
import { useEffect, useState } from "react";

export default function Tarifas() {
  const [trabajadorId, setTrabajadorId] = useState("");

  const [matrizEditable, setMatrizEditable] = useState({});
  const [matrizOriginal, setMatrizOriginal] = useState({});
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => setMessage(""), 5000);

    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    setMessage("");
  }, [trabajadorId]);

  // hook Obtener tarifas y trabajadores
  const {
    cargos,
    referencias,
    precios,
    loading: tarifasLoading,
    error: tarifasError,
  } = useObtenerTarifas(trabajadorId);

  //hook para crear tarifas
  const guardarTarifasMutation = useGuardarTarifas(trabajadorId);

  // hook para obtener trabajadores para el select
  const { trabajadoresSelect, loading: trabajadoresLoading } =
    useTrabajadoresSelect();

  console.log("trabajadoresSelect:", trabajadoresSelect);

  const cambiosPendientes = detectarCambios(
    matrizOriginal,
    matrizEditable,
  ).length;

  // Sincronizar matriz editable cuando cambian los precios
  useEffect(() => {
    if (!precios || Object.keys(precios).length === 0) return;
    setMatrizEditable(structuredClone(precios));
    setMatrizOriginal(structuredClone(precios));
  }, [precios]);

  const data = referencias.map((ref) => {
    const fila = { referencia: ref.nombre, cofreId: ref.id };
    cargos.forEach((cargo) => {
      fila[cargo.id] = matrizEditable?.[ref.id]?.[cargo.id] ?? "";
    });
    return fila;
  });

  // Construir columnas para la tabla a partir de cargos
  const columns = [
    {
      key: "referencia",
      label: "Referencia",
    },

    ...cargos.map((cargo) => ({
      key: String(cargo.id),
      label: cargo.nombre,
      render: (row) => (
        <div className="input-precio-wrapper">
          <span className="input-precio-simbolo">$</span>
          <input
            type="number"
            value={row[cargo.id] ?? ""}
            placeholder="0"
            onChange={(e) =>
              handleChange(row.cofreId, cargo.id, e.target.value)
            }
            className={
              row[cargo.id] !== null && row[cargo.id] !== ""
                ? "input-con-precio"
                : "input-sin-precio"
            }
          />
        </div>
      ),
    })),
  ];

  // 🔹 Cambio en celda
  function handleChange(cofreId, cargoId, valor) {
    setMatrizEditable((prev) => ({
      ...prev,
      [cofreId]: {
        ...prev[cofreId],
        [cargoId]: valor,
      },
    }));
  }

  // 🔹 Guardar cambios
  function handleGuardar() {
    const cambios = detectarCambios(matrizOriginal, matrizEditable);

    if (cambios.length === 0) {
      setMessage("No hay cambios para guardar");
      return;
    }

    guardarTarifasMutation.mutate(cambios, {
      onSuccess: () => {
        setMessage("Tarifas actualizadas correctamente");
        setMatrizOriginal(structuredClone(matrizEditable));
      },
      onError: (error) => {
        setMessage(error.message);
      },
    });
  }
  if (tarifasLoading || trabajadoresLoading)
    return <p>Cargando tarifas y trabajadores...</p>;

  if (tarifasError || guardarTarifasMutation.error)
    return <p>Error cargando tarifas y trabajadores...</p>;

  return (
    <div className="page-content-tarifas">
      <div className="header-page">
        <h1 className="page-tittle">Tarifas</h1>
        <p className="page-mini-info">Precios por referencia y cargo</p>
      </div>

      <Card className="card-tarifas" style={{ backgroundColor: "#ffffff" }}>
        <TableHeader
          filters={[
            {
              name: "trabajador",
              value: trabajadorId,
              onChange: setTrabajadorId,
              placeholder: "Seleccionar trabajador...",
              options: trabajadoresSelect,
            },
          ]}
          actions={[
            {
              name: "guardar",
              label: guardarTarifasMutation.isPending
                ? "Guardando..."
                : "Guardar",
              onClick: handleGuardar,
              disabled:
                guardarTarifasMutation.isPending || cambiosPendientes === 0,
              className: "btn-secondary",
            },
          ]}
        />
        {message && <div className="mensaje">{message}</div>}
        <div className="tarifas-toolbar">
          {cambiosPendientes > 0 && (
            <span className="badge-cambios">
              {cambiosPendientes} cambio{cambiosPendientes > 1 ? "s" : ""} sin
              guardar
            </span>
          )}
        </div>
        {trabajadorId && <Table columns={columns} data={data} />}
      </Card>
    </div>
  );
}
