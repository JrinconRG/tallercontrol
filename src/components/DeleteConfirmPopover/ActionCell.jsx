import { useState } from "react";
import DeleteConfirmPopover from "./DeleteConfirmPopover";
import { Icon } from "../ui/Icon";
export default function ActionCell({
  row,
  displayField,
  itemAEliminar,
  setItemAEliminar,
  isDeleting,
  handleConfirmarEliminar,
}) {
  const [coords, setCoords] = useState(null);
  const isOpen = itemAEliminar?.id === row.id;

  const handleClickDelete = (e) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const popoverWidth = 220;

    setCoords({
      top: rect.bottom + 6,
      left: rect.right - popoverWidth,
    });

    setItemAEliminar(row);
  };

  const handleCancel = () => {
    setItemAEliminar(null);
    setCoords(null);
  };

  return (
    <div className="notion-cell-container">
      <span>{row[displayField]}</span>

      <div className="notion-action-floating">
        <button
          type="button"
          className="btn-notion-delete"
          aria-label={`Eliminar ${row.nombre ?? row[displayField]}`}
          onClick={handleClickDelete}
        >
          <Icon name="Trash" size="10" /> Eliminar
        </button>

        <DeleteConfirmPopover
          open={isOpen}
          coords={coords}
          nombreItem={row.nombre}
          loading={isDeleting}
          onConfirm={handleConfirmarEliminar}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
