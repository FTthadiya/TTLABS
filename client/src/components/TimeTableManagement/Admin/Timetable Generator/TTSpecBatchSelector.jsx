import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getSpecBatches } from "../../Services/SpecBatchService";
import { saveTimetableData } from "../../Services/TimetableService";
import BatchSelector from "../Forms/BatchSelector";
import "../../Css/form.css";
import "../../Css/button.css";
import SuccessAlert from "../../Common/SuccessAlert";
import CurrSemUpdater from "./CurrSemUpdater";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function TTSpecBatchSelector(props) {
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(true);
  const [allBatches, setAllBatches] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    handleSpecBatchAssign();
  }, []);

  const handleSpecBatchAssign = async () => {
    const { data } = await getSpecBatches();
    setBatches(data);
    setAllBatches(data);
  };

  const handleAdd = (specBatch) => {
    const newSelectedBatches = [...selectedBatches, specBatch];
    const newBatches = batches.filter((sb) => sb._id !== specBatch._id);

    setSelectedBatches(newSelectedBatches);
    setBatches(newBatches);
  };

  const handleDelete = (specBatch) => {
    const newSelectedBatches = selectedBatches.filter(
      (sb) => sb._id !== specBatch._id
    );
    const newBatches = [...batches, specBatch];

    setBatches(newBatches);
    setSelectedBatches(newSelectedBatches);
  };

  const handleSelect = () => {
    setIsSelectAll(!isSelectAll);
    if (isSelectAll) {
      setSelectedBatches(allBatches);
      setBatches([]);
    } else {
      setBatches(allBatches);
      setSelectedBatches([]);
    }
  };

  const handleButtonState = () => {
    if (selectedBatches.length === 0) {
      return true;
    }
    return false;
  };

  const handleGenerate = async () => {
    const updateCurrSemester = async () => {
      return new Promise((resolve, reject) => {
        CurrSemUpdater(async (result) => {
          if (result) {
            try {
              const { data } = await axios.put(
                "http://localhost:3001/api/functionalities/getCurrSemester",
                result
              );
              SuccessAlert("Current semester updated successfully.");
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error("No result from CurrSemUpdater"));
          }
        });
      });
    };

    const specBatchesIds = extractBatchIds(selectedBatches);

    const generateData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3001/api/generateTimetables/",
          { specBatchesIds: specBatchesIds }
        );
      } catch (error) {
        toast.error("Failed to generate timetables");
        console.error("Failed to generate timetables:", error);
        throw error;
      }
    };

    if (specBatchesIds.length > 0) {
      try {
        await updateCurrSemester();
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we generate the timetables.",
          background: "#f0edd4",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        await generateData();
        Swal.close();
        navigate("/conflicts-resolver", { state: { specBatchesIds } });
      } catch (error) {
        Swal.close();
        toast.error("Error during timetable generation");
        console.error("Error during timetable generation:", error);
      }
    } else {
      toast.error("No batch IDs provided.");
      console.error("No batch IDs provided.");
    }
  };

  const extractBatchIds = (batches) => {
    const specBatchesIds = batches.map((batch) => batch._id);
    return specBatchesIds;
  };

  return (
    <div>
      <h3 className="text-center text-dark">Generation Batch Selector</h3>
      <br />
      <main
        className="container mx-auto form-container"
        data-intro="Select the batches to generate timetables"
      >
        <div className="row">
          <div className="col mt-3">
            <p className="text-dark d-inline-block">
              Use the checkbox to select all or deselect all batches: &nbsp;
            </p>
            <input
              type="checkbox"
              className="btn-check"
              id="btncheck1"
              autoComplete="off"
              checked={!isSelectAll}
              onChange={() => handleSelect()}
            />
            <label
              className={
                !isSelectAll
                  ? "btn custom-button"
                  : "btn custom-input-button-unchecked"
              }
              htmlFor="btncheck1"
            >
              {!isSelectAll ? "Deselect All" : "Select All"}
            </label>
          </div>
        </div>
        <hr
          style={{
            marginLeft: "20px",
            marginRight: "20px",
            paddingBottom: "0px",
          }}
        />
        <BatchSelector
          batches={batches}
          selectedBatches={selectedBatches}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
        <div className="row ">
          <div className="col mt-3 d-flex justify-content-end">
            <button
              className="btn custom-button"
              disabled={handleButtonState()}
              onClick={handleGenerate}
            >
              Generate
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TTSpecBatchSelector;
