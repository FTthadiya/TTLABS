import React from "react";
import CustomTable from "./../Common/CustomTable";

function LecturerTable({ paginatedLecturers, onDelete }) {
  const columns = [
    { path: "lecturerName", label: "Lecturer Name" },
    { path: "email", label: "E-mail" },
    {
      key: "delete",
      content: (lecturer) => (
        <button
          onClick={() => onDelete(lecturer)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      ),
    },
  ];

  return <CustomTable columns={columns} data={paginatedLecturers} />;
}

export default LecturerTable;
