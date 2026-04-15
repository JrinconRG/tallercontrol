import Modal from "../modal/Modal";
import { useImagenes } from "../../hooks/useSubprocesos";
import PropTypes from "prop-types";

export default function MostrarImagenesModal({ isOpen, onClose, path, fase }) {
  //hoook de las imagenes
  const { url, urls, loading } = useImagenes(path);

  return (
    <Modal
      isOpen={isOpen}
      title={fase ? `Evidencia: ${fase}` : "Imágenes"}
      onClose={onClose}
    >
      {loading && <p>Cargando imágenes...</p>}
      {!loading && url && (
        <img
          src={url}
          alt="evidencia"
          style={{
            maxWidth: "100%",
            maxHeight: "500px", // El alto que desees
            objectFit: "contain", // Mantiene la proporción cortando excedentes

            // Centra la imagen dentro del recuadro
          }}
        />
      )}

      {!loading && urls?.length > 1 && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {urls.map((img) => (
            <img
              key={img}
              src={img}
              alt={`${fase}`}
              style={{ width: "120px", borderRadius: "8px" }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
MostrarImagenesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  path: PropTypes.array,
  fase: PropTypes.string,
};
