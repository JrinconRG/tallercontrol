import { useState, useEffect } from "react";

import { getImageUrl } from "../services/storage";

export function useImagenes(paths) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarImagenes = async () => {
      if (!paths) {
        setUrls([]);
        setLoading(false);
        return;
      }
      const lista = Array.isArray(paths) ? paths : [paths];
      setLoading(true);
      const resultadosImagenes = await Promise.all(
        lista.map((p) => getImageUrl(p)),
      );

      setUrls(resultadosImagenes.filter(Boolean));
      setLoading(false);
    };
    cargarImagenes();
  }, [paths]);
  return { urls, url: urls[0] || null, loading };
}
