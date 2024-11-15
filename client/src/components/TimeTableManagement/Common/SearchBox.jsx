import React from "react";
import "./../Css/searchbox.css";

function SearchBox({ value, onChange }) {
  return (
    <div className="custom-search-wrapper">
      <input
        type="text"
        name="query"
        className="form-control mb-3 bg-secondary text-white custom-search-input-style"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      <i
        className="fa fa-search custom-search-search-icon"
        aria-hidden="true"
      ></i>
    </div>
  );
}

export default SearchBox;
