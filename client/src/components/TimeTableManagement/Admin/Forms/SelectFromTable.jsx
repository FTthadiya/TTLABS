import React from "react";
import CustomTable from "../../Common/CustomTable";

function SelectFromTable({ paginatedSpecBatches, onAdd }) {
  const columns = [
    { path: "specName", label: "Specialization Name" },
    { path: "year", label: "Year" },
    { path: "semester", label: "Semester" },
    {
      key: "Select",
      content: (specBatch) => (
        <button
          onClick={() => onAdd(specBatch)}
          className="btn btn-info btn-sm"
        >
          {<i className="fa fa-plus-circle" aria-hidden="true"></i>}
        </button>
      ),
    },
  ];

  return <CustomTable columns={columns} data={paginatedSpecBatches} />;
}

export default SelectFromTable;
