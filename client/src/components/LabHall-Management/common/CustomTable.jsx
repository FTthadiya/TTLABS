import React from "react";
import _ from "lodash";
import "./CustomTable.css";
import "../../TimeTableManagement/Css/table.css"

function CustomTable({ columns, data }) {
  const renderCell = (item, column) => {
    if (column.content) return column.content(item);

    return _.get(item, column.path);
  };

  const createKey = (item, column) => {
    return item._id + (column.path || column.key);
  };

  return (
    <div className="custom-table-container" style={{justifyContent: "center"}}>
      <table className="table common-table" style={{width: "70%", borderRadius: "10px", }}>
        <thead >
          <tr>
            {columns.map((column) => (
              <th key={column.path || column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((column, columnIndex) => (
                <td key={createKey(item, column)}>{renderCell(item, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomTable;
