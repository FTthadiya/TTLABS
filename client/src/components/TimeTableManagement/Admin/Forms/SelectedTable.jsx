import React from "react";
import CustomTable from "../../Common/CustomTable";

function SelectedTable({ paginatedSpecBatches, onDelete }) {
  const columns = [
    { path: "specName", label: "Specialization Name" },
    { path: "year", label: "Year" },
    { path: "semester", label: "Semester" },
    {
      key: "Select",
      content: (specBatch) => (
        <button
          onClick={() => onDelete(specBatch)}
          className="btn btn-danger btn-sm"
        >
          {<i className="fa fa-trash-o" aria-hidden="true"></i>}
        </button>
      ),
    },
  ];

  return <CustomTable columns={columns} data={paginatedSpecBatches} />;
}

export default SelectedTable;
