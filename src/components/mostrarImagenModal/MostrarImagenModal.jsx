import Modal from "../modal/Modal";
import { useImagenes } from "../../hooks/useSubprocesos";

export default function MostrarImagenesModal({ isOpen, onClose, path, fase }) {
  //hoook de las imagenes
  const { url, urls, loading } = useImagenes(path);

  return (
    <Modal
      isOpen={isOpen}
      title={fase ? `Evidencia: ${fase}` : "Imágenes"}
      onClose={onClose}
      onConfirm={onClose}
      confirmText="Cerrar"
    >
      {loading && <p>Cargando imágenes...</p>}
      {!loading && url && (
        <img
          src={url}
          alt="evidencia"
          style={{
            maxWidth: "100%",
            borderRadius: "12px",
          }}
        />
      )}

      {!loading && urls?.length > 1 && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {urls.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`img-${i}`}
              style={{ width: "120px", borderRadius: "8px" }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
