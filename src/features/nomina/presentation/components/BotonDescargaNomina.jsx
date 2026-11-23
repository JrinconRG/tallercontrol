import PropTypes from "prop-types";
import { Icon } from "../../../../components/ui/Icon";
import { useDescargarNomina } from "../../application/hooks/useDescargarNomina";
import "./BotonDescargaNomina.css";

const FORMATOS = [
  { id: "pdf", etiqueta: "PDF" },
  { id: "excel", etiqueta: "Excel" },
];

export default function BotonDescargaNomina({ nomina }) {
  const { descargar, formatoActivo } = useDescargarNomina(nomina);
  const ocupado = formatoActivo !== null;

  return (
    <div className="descarga-grupo">
      {FORMATOS.map(({ id, etiqueta }) => (
        <button
          key={id}
          type="button"
          className={`btn btn-secondary btn-descarga btn-descarga--${id}`}
          onClick={() => descargar(id)}
          disabled={ocupado}
          title={`Descargar ${etiqueta}`}
          aria-label={`Descargar nómina ${nomina.nominaId} en ${etiqueta}`}
        >
          {formatoActivo === id ? (
            <span className="descarga-spinner" />
          ) : (
            <Icon name="Download" size={16} color="currentColor" />
          )}
          {etiqueta}
        </button>
      ))}
    </div>
  );
}

BotonDescargaNomina.propTypes = {
  nomina: PropTypes.shape({
    nominaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  }).isRequired,
};
