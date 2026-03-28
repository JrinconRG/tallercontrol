import { detectarCambios } from "../../../utils/construirMatrizTarifas";
import { useObtenerTarifas, useCrearTarifas } from "../../../hooks/useTarifas";
import { useTrabajadoresSelect } from "../../../hooks/useTrabajadores";
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

  // hook Obtener tarifas y trabajadores
  const {
    cargos,
    referencias,
    precios, // ya viene estructurado como { cofreId: { cargoId: valor } }
    loading: tarifasLoading,
    error: tarifasError,
  } = useObtenerTarifas(trabajadorId);

  //hook para crear tarifas
  const {
    loading: crearTarifasLoading,
    error: crearTarifasError,
    crearPrecio,
  } = useCrearTarifas();

  // hook para obtener trabajadores para el select
  const {
    trabajadores: trabajadoresSelect,
    loading: trabajadoresLoading,
    error: trabajadoresError,
  } = useTrabajadoresSelect();
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
  async function handleGuardar() {
    setMessage("");
    const cambios = detectarCambios(matrizOriginal, matrizEditable);

    if (cambios.length === 0) {
      setMessage("No hay cambios para guardar");
      return;
    }

    try {
      await Promise.all(
        cambios.map((c) =>
          crearPrecio(c.trabajadorCargoId, c.cofreId, c.valor),
        ),
      );

      setMessage("Tarifas actualizadas correctamente");

      // Actualizamos original despues de guardar

      setMatrizOriginal(structuredClone(matrizEditable));
    } catch (error) {
      console.error(error);
      setMessage(error.message);
      setTimeout(() => setMessage(""), 10000); // se borra en 3s
    }
  }

  if (tarifasLoading || trabajadoresLoading || crearTarifasLoading)
    return <p>Cargando tarifas y trabajadores...</p>;

  if (trabajadoresError || tarifasError || crearTarifasError)
    return <p>Error cargando tarifas y trabajadores...</p>;

  return (
    <div className="page-content-tarifas">
      <div className="page-header-tarifas">
        <h1>Tarifas</h1>
        <p>Precios por referencia y cargo</p>
      </div>

      <Card className="card-tarifas" style={{ backgroundColor: "#ffffff" }}>
        <TableHeader
          filters={[
            {
              name: "trabajador",
              value: trabajadorId,
              onChange: setTrabajadorId,
              placeholder: "Seleccionar trabajador...",
              options: trabajadoresSelect.map((t) => ({
                value: t.t_id,
                label: t.trabajador_nombre_completo,
              })),
            },
          ]}
          actions={[
            {
              name: "guardar",
              label: crearTarifasLoading ? "Guardando..." : "Guardar",
              onClick: handleGuardar,
              disabled: crearTarifasLoading || cambiosPendientes === 0,
              className: "btn-guardar",
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
