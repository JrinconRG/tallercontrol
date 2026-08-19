import { useState, useMemo, useCallback } from "react";

export function usePagination(data, initialLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = page > totalPages ? totalPages : page;

  const paginatedData = useMemo(() => {
    const offset = (currentPage - 1) * limit;
    return data.slice(offset, offset + limit);
  }, [data, currentPage, limit]);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  return {
    page: currentPage,
    limit,
    totalItems,
    paginatedData,
    setPage,
    setLimit: handleLimitChange,
    resetPage,
  };
}
