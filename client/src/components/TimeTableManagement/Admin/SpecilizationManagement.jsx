import React, { useEffect, useState } from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import {
  getSpecBatches,
  deleteSpecBatch,
  getSpecNames,
} from "./../Services/SpecBatchService";
import Pagination from "./../Common/Pagination";
import { paginate } from "./../Utils/paginate";
import SpecBatchTable from "./SpecBatchTable";
import ListGroup from "./../Common/ListGroup";
import SearchBox from "../Common/SearchBox";
import { Link } from "react-router-dom";
import "../Css/button.css";
import DeleteConfirmation from "./../Common/DeleteConfirmation";

function SpecilizationManagement(props) {
  const [specBatches, setSpecBatches] = useState([]);
  const [specilizations, setSpecilizations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    handleSPecBatchAssign();
    handleSpecsAssign();
  }, [specBatches]);

  const handleSPecBatchAssign = async () => {
    const { data } = await getSpecBatches();
    setSpecBatches(data);
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

  const handleDelete = async (specBatch) => {
    DeleteConfirmation(async () => {
      const initSpecBatches = specBatches;
      const updatedSpecBatches = specBatches.filter(
        (sb) => sb._id !== specBatch._id
      );
      setSpecBatches(updatedSpecBatches);

      try {
        await deleteSpecBatch(specBatch._id);
        handleSpecsAssign();
      } catch (error) {
        if (error.response && error.response.status === 404)
          toast.error("Specilization Batch is already removed.");
        setSpecBatches(initSpecBatches);
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

  const getPagedData = () => {
    let filtered = specBatches;
    if (searchQuery)
      filtered = specBatches.filter((sb) =>
        sb.specName.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else if (selectedSpec && selectedSpec._id) {
      filtered = specBatches.filter((sb) => sb.specName === selectedSpec.name);
    }

    const sorted = _.orderBy(filtered, ["specName", "year", "semester"], "asc");
    const paginatedSpecBatches = paginate(sorted, currentPage, pageSize);
    const totalCount = filtered ? filtered.length : 0;

    return { totalCount, data: paginatedSpecBatches };
  };

  const addNewItem = () => {
    return (
      <div className="row mb-3">
        <div className="col">
          <Link
            className="btn btn-primary custom-button"
            to="/specilization-management/new-specilization"
          >
            Add Specialization
          </Link>
          <Link
            className="btn btn-primary custom-button ms-3 "
            to="/specilization-management/new-batch"
          >
            Add batch
          </Link>
        </div>
      </div>
    );
  };

  const { totalCount, data } = getPagedData();

  return (
    <div>
      <h3 className="text-center text-dark">Specialization Management</h3>
      <br />
      <main className="container mx-auto">
        {specBatches.length === 0 ? (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <p className="text-dark" style={{ fontSize: 20 }}>
              No Specializations or Batches found.
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
                usedIn="Specilization"
              />
            </div>
            <div className="col">
              <div className="row">
                <div className="col">{addNewItem()}</div>
                <div className="col">
                  <SearchBox value={searchQuery} onChange={handleSearch} />
                </div>
              </div>
              <SpecBatchTable
                paginatedSpecBatches={data}
                onDelete={handleDelete}
              />
              <Pagination
                itemCount={totalCount ? totalCount : 0}
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

export default SpecilizationManagement;
