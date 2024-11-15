import React, { useState, useEffect } from "react";
import _ from "lodash";
import { getSubjects, deleteSubject } from "../Services/SubjectService";
import { getSpecNames } from "../Services/SpecBatchService";
import Pagination from "./../Common/Pagination";
import { paginate } from "./../Utils/paginate";
import SearchBox from "../Common/SearchBox";
import SubjectTable from "./SubjectTable";
import ListGroup from "./../Common/ListGroup";
import { Link } from "react-router-dom";
import "../Css/button.css";
import DeleteConfirmation from "../Common/DeleteConfirmation";

function SubjectManagement(props) {
  const [subjects, setSubjects] = useState([]);
  const [specilizations, setSpecilizations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    handleSubjectsAssign();
    handleSpecsAssign();
  }, []);

  const handleSubjectsAssign = async () => {
    const { data } = await getSubjects();
    setSubjects(data);
  };

  const handleSpecsAssign = async () => {
    const { data } = await getSpecNames();
    let specilizationsObj = [{ _id: "", name: "All Specilizations" }];
    data.map((specName, index) => {
      specilizationsObj.push({
        _id: index + 1,
        name: specName,
      });
    });
    setSpecilizations(specilizationsObj);
  };

  const handleDelete = async (subject) => {
    DeleteConfirmation(async () => {
      const initSubjects = subjects;
      const updatedSubjects = subjects.filter((s) => s._id !== subject._id);
      setSubjects(updatedSubjects);
      try {
        await deleteSubject(subject._id);
      } catch (error) {
        if (error.response && error.response.status === 404)
          toast.error("Subject is already removed.");
        setSubjects(initSubjects);
      }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSpecilizationSelect = (specilization) => {
    setSelectedSpec(specilization);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedSpec(null);
    setCurrentPage(1);
  };

  const addNewItem = () => {
    return (
      <div className="row mb-3">
        <div className="col">
          <Link
            className="btn btn-primary custom-button"
            to="/subject-management/new-subject"
          >
            Add Subject
          </Link>
          <Link
            className="btn btn-primary ms-3 custom-button"
            to="/subject-management/new-session"
          >
            Add Session
          </Link>
        </div>
      </div>
    );
  };

  const getPagedData = () => {
    let filtered = subjects;
    if (searchQuery)
      filtered = subjects.filter((s) =>
        s.subjectName.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else if (selectedSpec && selectedSpec._id) {
      filtered = subjects.filter((sb) => {
        return sb.specBatches.some(
          (spec) => spec.specName === selectedSpec.name
        );
      });
    }

    const sorted = _.orderBy(filtered, "subjectName", "asc");
    const paginatedSubjects = paginate(sorted, currentPage, pageSize);
    const totalCount = filtered ? filtered.length : 0;

    return { totalCount, data: paginatedSubjects };
  };

  const { totalCount, data } = getPagedData();

  return (
    <div>
      <h3 className="text-center text-dark">Subject Management</h3>
      <br />
      <main className="container mx-auto">
        {subjects.length === 0 ? (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <p className="text-dark" style={{ fontSize: 20 }}>
              No Subjects found.
            </p>
            {addNewItem()}
          </div>
        ) : (
          <div className="row">
            <div className="col-3">
              <ListGroup
                items={specilizations}
                selectedItem={selectedSpec}
                onItemSelect={handleSpecilizationSelect}
                usedIn="Subject"
              />
            </div>
            <div className="col">
              <div className="row">
                <div className="col">{addNewItem()}</div>
                <div className="col">
                  <SearchBox value={searchQuery} onChange={handleSearch} />
                </div>
              </div>
              <SubjectTable paginatedSubjects={data} onDelete={handleDelete} />
              <Pagination
                itemCount={totalCount}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SubjectManagement;
