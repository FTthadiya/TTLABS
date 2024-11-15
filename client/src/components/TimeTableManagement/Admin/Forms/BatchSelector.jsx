import React, { useState } from "react";
import _ from "lodash";
import Pagination from "./../../Common/Pagination";
import { paginate } from "./../../Utils/paginate";
import SelectFromTable from "./SelectFromTable";
import SearchBox from "../../Common/SearchBox";
import SelectedTable from "./SelectedTable";

function BatchSelector({ batches, selectedBatches, onAdd, onDelete }) {
  const [selectFromQuery, setselectFromQuery] = useState("");
  const [selectedQuery, setselectedQuery] = useState("");
  const [selectFromCP, setselectFromCP] = useState(1);
  const [selectedCP, setselectedCP] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const handlePageChangeSelectFrom = (page) => {
    setselectFromCP(page);
  };

  const handlePageChangeSelected = (page) => {
    setselectedCP(page);
  };

  const handleSearchSelectFrom = (query) => {
    setselectFromQuery(query);
    setselectFromCP(1);
  };

  const handleSearchSelected = (query) => {
    setselectedQuery(query);
    setselectedCP(1);
  };

  const getPagedSelectFromData = () => {
    let filteredSelectFrom = batches;
    if (selectFromQuery)
      filteredSelectFrom = batches.filter((sb) =>
        sb.specName.toLowerCase().startsWith(selectFromQuery.toLowerCase())
      );
    const sorted = _.orderBy(
      filteredSelectFrom,
      ["specName", "year", "semester"],
      "asc"
    );
    const selectFromPaged = paginate(sorted, selectFromCP, pageSize);

    return { totalCount: filteredSelectFrom.length, data: selectFromPaged };
  };

  const getPagedSelectedData = () => {
    let filteredSelected = selectedBatches;
    if (selectedQuery)
      filteredSelected = selectedBatches.filter((sb) =>
        sb.specName.toLowerCase().startsWith(selectedQuery.toLowerCase())
      );

    const sorted = _.orderBy(
      filteredSelected,
      ["specName", "year", "semester"],
      "asc"
    );
    const selectedPaged = paginate(sorted, selectedCP, pageSize);

    return { totalCount: filteredSelected.length, data: selectedPaged };
  };

  const { totalCount: totalCountSelectFrom, data: selectFromPaged } =
    getPagedSelectFromData();
  const { totalCount: totalCountSelected, data: selectedPaged } =
    getPagedSelectedData();

  return (
    <div className="row">
      <div className="col">
        {batches.length ? (
          <div>
            <p className="text-dark">
              Select the batches that follows this subject
            </p>
            <SearchBox
              value={selectFromQuery}
              onChange={handleSearchSelectFrom}
            />
            <SelectFromTable
              paginatedSpecBatches={selectFromPaged}
              onAdd={onAdd}
            />
            <Pagination
              itemCount={totalCountSelectFrom}
              pageSize={pageSize}
              currentPage={selectFromCP}
              onPageChange={handlePageChangeSelectFrom}
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className="col-1"></div>
      {selectedBatches.length ? (
        <div className="col">
          <p className="text-dark">Selected batches</p>
          <SearchBox value={selectedQuery} onChange={handleSearchSelected} />
          <SelectedTable
            paginatedSpecBatches={selectedPaged}
            onDelete={onDelete}
          />
          <Pagination
            itemCount={totalCountSelected}
            pageSize={pageSize}
            currentPage={selectedCP}
            onPageChange={handlePageChangeSelected}
          />
        </div>
      ) : (
        <div className="col d-flex flex-column justify-content-center align-items-center text-center">
          <i
            className="fa fa-exclamation-circle text-danger fa-3x"
            aria-hidden="true"
          ></i>
          <p className="text-danger fs-4">No selected batches</p>
        </div>
      )}
    </div>
  );
}

export default BatchSelector;
