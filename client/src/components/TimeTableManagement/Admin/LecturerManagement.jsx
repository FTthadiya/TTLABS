import React, { useState, useEffect } from "react";
import { getLecturers, deleteLecturer } from "./../Services/LecturerService";
import SearchBox from "./../Common/SearchBox";
import Pagination from "./../Common/Pagination";
import { paginate } from "./../Utils/paginate";
import LecturerTable from "./LecturerTable";
import DeleteConfirmation from "../Common/DeleteConfirmation";
import axios from "axios";
import { toast } from "react-toastify";

function LecturerManagement(props) {
  const [lecturers, setLecturers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    handleLecturerAssign();
  }, []);

  const handleLecturerAssign = async () => {
    const { data } = await getLecturers();
    setLecturers(data);
  };

  const handleDelete = async (lecturer) => {
    DeleteConfirmation(async () => {
      const initLecturers = lecturers;
      const updatedLecturers = lecturers.filter((l) => l._id !== lecturer._id);
      setLecturers(updatedLecturers);

      try {
        await deleteLecturer(lecturer._id);
        await axios.delete(
          `http://localhost:3001/api/adminprofilemanagement/users/${lecturer._id}`
        );
      } catch (error) {
        if (error.response && error.response.status === 404)
          toast.error("Lecturer is already removed.");
        setLecturers(initLecturers);
      }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const getPagedData = () => {
    let filtered = lecturers;
    if (searchQuery) {
      filtered = lecturers.filter((l) =>
        l.lecturerName.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    }
    const paginatedLecturers = paginate(filtered, currentPage, pageSize);
    return { totalCount: filtered.length, data: paginatedLecturers };
  };

  const { totalCount, data } = getPagedData();

  return (
    <div>
      <h3 className="text-center text-dark">Lecturer Management</h3>
      <br />
      <main className="container mx-auto">
        {lecturers.length === 0 ? (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <p className="text-dark" style={{ fontSize: 20 }}>
              No Lecturers found.
            </p>
          </div>
        ) : (
          <div>
            <SearchBox value={searchQuery} onChange={handleSearch} />
            <LecturerTable paginatedLecturers={data} onDelete={handleDelete} />
            <Pagination
              itemCount={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default LecturerManagement;
