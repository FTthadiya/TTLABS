import React from "react";
import { Link } from "react-router-dom";
import CustomTable from "./../Common/CustomTable";

function SubjectTable({ paginatedSubjects, onDelete }) {
  const columns = [
    {
      path: "subjectName",
      label: "Subject Name",
      content: (subject) => (
        <Link
          className="text-primary"
          to={`/subject-management/${subject._id}`}
        >
          {subject.subjectName}
        </Link>
      ),
    },
    { path: "subjectCode", label: "Subject Code" },
    { path: "sessionType", label: "Session Type" },
    { path: "duration", label: "Duration (in Hours)" },
    { path: "studentCount", label: "Student Count" },
    { path: "lecturer.lecturerName", label: "Lecturer" },
    {
      key: "delete",
      content: (subject) => (
        <button
          onClick={() => onDelete(subject)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      ),
    },
  ];

  return <CustomTable columns={columns} data={paginatedSubjects} />;
}
export default SubjectTable;
