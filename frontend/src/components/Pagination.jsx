import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component
 * 
 * Implements Issue #6: Dynamic page count calculation,
 * previous/next page navigation, disabled button states,
 * and displaying current page slice information.
 */
export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 5,
  onPageChange = () => {},
}) => {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-bar">
      <div>
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong> {totalItems === 1 ? 'task' : 'tasks'}
      </div>

      <div className="pagination-controls">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

