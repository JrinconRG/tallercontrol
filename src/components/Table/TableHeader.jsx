import SearchBar from "../ui/seachBar";
import Select from "../ui/select";
import "./TableHeader.css";

export default function TableHeader({
  nombre = null,
  searchValue,
  onSearchChange,
  filters = [],
  actions = [],
}) {
  return (
    <div className="table-header">
      <div className="table-header-left">
        {nombre && <h2 className="tituloTabla">{nombre}</h2>}

        {filters.map((filter) => (
          <Select key={filter.name} {...filter} />
        ))}
        {onSearchChange && (
          <SearchBar value={searchValue} onChange={onSearchChange} />
        )}
      </div>
      <div className="table-header-right">
        {actions.map((action) => (
          <button
            key={action.name || action.label}
            {...action}
            className={
              action.className ? `btn ${action.className}` : "btn btn-secondary"
            }
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
