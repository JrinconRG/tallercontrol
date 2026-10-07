import { useState, useEffect } from "react";

import { getImageUrl } from "../services/storage";

export function useImagenes(paths) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarImagenes = async () => {
      if (!paths) {
        setUrls([]);
        setError(null);
        setLoading(false);
        return;
      }
      const lista = Array.isArray(paths) ? paths : [paths];
      setLoading(true);
      setError(null);
      try {
        const resultadosImagenes = await Promise.all(
          lista.map((p) => getImageUrl(p)),
        );
        setUrls(resultadosImagenes.filter(Boolean));
      } catch (loadError) {
        setUrls([]);
        setError(loadError);
      } finally {
        setLoading(false);
      }
    };
    cargarImagenes();
  }, [paths]);
  return { urls, url: urls[0] || null, loading, error };
}
