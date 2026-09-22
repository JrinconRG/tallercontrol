import SearchBar from "../../../../components/ui/seachBar";
import Select from "../../../../components/ui/select";
import "./FiltrosProcesos.css";

export default function FiltrosProcesos({
  search,
  onSearchChange,
  filtroReferencia,
  onFiltroReferenciaChange,
  filtroFase,
  onFiltroFaseChange,
  filtroTrabajador,
  onFiltroTrabajadorChange,
  filtroOrden,
  onFiltroOrdenChange,
  opcionesReferencias,
  opcionesFases,
  opcionesTrabajadores,
  hayFiltros,
  onLimpiar,
}) {
  return (
    <div className="filtros-procesos">
      <div className="filtros-procesos-controles">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por código o referencia..."
        />
        <Select
          name="referencia"
          value={filtroReferencia}
          onChange={onFiltroReferenciaChange}
          options={opcionesReferencias}
          placeholder="Todas las referencias"
        />
        <Select
          name="fase"
          value={filtroFase}
          onChange={onFiltroFaseChange}
          options={opcionesFases}
          placeholder="Todas las fases"
        />
        <Select
          name="trabajador"
          value={filtroTrabajador}
          onChange={onFiltroTrabajadorChange}
          options={opcionesTrabajadores}
          placeholder="Todos los trabajadores"
        />
        <Select
          name="orden"
          value={filtroOrden}
          onChange={onFiltroOrdenChange}
          options={[
            { value: "reciente", label: "Más recientes" },
            { value: "antiguo", label: "Más antiguos" },
          ]}
          placeholder="Ordenar por"
        />
      </div>
      {hayFiltros && (
        <button
          className="btn btn-secondary filtros-limpiar"
          onClick={onLimpiar}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
