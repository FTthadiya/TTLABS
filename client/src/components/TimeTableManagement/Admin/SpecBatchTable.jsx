import React from "react";
import CustomTable from "./../Common/CustomTable";

function SpecBatchTable({ paginatedSpecBatches, onDelete }) {
  const columns = [
    { path: "specName", label: "Specialization Name" },
    { path: "year", label: "Year" },
    { path: "semester", label: "Semester" },
    {
      key: "delete",
      content: (specBatch) => (
        <button
          onClick={() => onDelete(specBatch)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      ),
    },
  ];

  return <CustomTable columns={columns} data={paginatedSpecBatches} />;
}

export default SpecBatchTable;
