import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import "../Css/pagination.css";

function Pagination({ itemCount, pageSize, currentPage, onPageChange }) {
  const pagesCount = Math.ceil(itemCount / pageSize);
  if (pagesCount === 1 && currentPage === 1) {
    return null;
  }
  const pages = _.range(1, pagesCount + 1);

  return (
    <nav>
      <ul className="pagination justify-content-start">
        {pages.map((page) => (
          <li
            key={page}
            className={page === currentPage ? "page-item active" : "page-item"}
          >
            <a
              className={
                page === currentPage
                  ? "page-link bg-primary "
                  : "page-link bg-secondary text-white"
              }
              style={{ cursor: "pointer" }}
              onClick={() => {
                onPageChange(page);
              }}
            >
              {page}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

Pagination.propTypes = {
  itemCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
