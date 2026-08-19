import React from "react";
import "./Pagination.css";
export default function Pagination({
  totalItems,
  limit,
  page,
  onPageChange,
  onLimitChange,
}) {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = page > totalPages ? totalPages : page;

  const numeracionPaginas = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination-container">
      <div className="pagination-limit">
        <span>Filas por página:</span>
        <select
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
            onPageChange(1);
          }}
        >
          {[5, 10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="pagination-navigation">
        <button
          className="pagination-arrow"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>

        <div className="pagination-numbers">
          {numeracionPaginas.map((num) => (
            <button
              key={num}
              className={`pagination-number-btn ${num === currentPage ? "active" : ""}`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          className="pagination-arrow"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
}
