import React, { Component } from "react";
import TimetableGrid from "../Common/TimetableGrid";
import Form from "./../Common/Form";
import Joi from "joi-browser";
import {
  getSpecNames,
  getBatchNames,
  getSpecBatchId,
  getSpecBatches,
} from "./../Services/SpecBatchService";
import { getSpecBatchTTData } from "../Services/TimetableService";
import TTLoading from "../../../assets/timetableManagement/TimetableLoading.png";
import "../Css/form.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../Css/button.css";
import { toPng } from "html-to-image";

class AdminTimetables extends Form {
  state = {
    data: { specilizationId: "", batchId: "" },
    errors: {},
    specilizations: [],
    batches: [],
    timetableData: [],
    messageData: {},
  };

  async componentDidMount() {
    try {
      const { data: specilizations } = await getSpecNames();

      let specWithId = specilizations.map((spec, index) => {
        return {
          _id: index,
          name: spec,
        };
      });

      const { data: batches } = await getBatchNames();
      let batchWithId = batches.map((batch, index) => {
        return {
          _id: index,
          name: batch.name,
          year: batch.year,
          semester: batch.semester,
        };
      });

      this.setState({ specilizations: specWithId, batches: batchWithId });
    } catch (error) {
      console.log(error);
    }
  }

  handleDownload = () => {
    const input = document.getElementById("timetable-grid");
    if (!input) {
      console.error("Element not found.");
      return;
    }

    const cropConfig = {
      width: 1500,
      height: 600,
      scale: 5,
    };

    toPng(input)
      .then((dataUrl) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = cropConfig.width;
          canvas.height = cropConfig.height;
          const ctx = canvas.getContext("2d");

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const imgWidth = img.width;
          const imgHeight = img.height;

          const offsetX = (canvas.width - imgWidth) / 2;
          const offsetY = (canvas.height - imgHeight) / 2;

          ctx.drawImage(
            img,
            0,
            0,
            imgWidth,
            imgHeight,
            offsetX,
            offsetY,
            imgWidth,
            imgHeight
          );

          const finalImageUrl = canvas.toDataURL("image/png");

          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [cropConfig.width, cropConfig.height],
          });

          pdf.addImage(
            finalImageUrl,
            "PNG",
            0,
            0,
            cropConfig.width,
            cropConfig.height
          );

          pdf.save("timetable.pdf");
        };
      })
      .catch((err) => {
        console.error("Failed to capture screenshot:", err);
      });
  };

  doSubmit = async () => {
    try {
      const { data, specilizations, batches } = this.state;

      const spec = specilizations.find(
        (s) => s._id === parseInt(data.specilizationId)
      );
      const batch = batches.find((b) => b._id === parseInt(data.batchId));

      const body = {
        specName: spec.name,
        year: parseInt(batch.year, 10),
        semester: parseInt(batch.semester, 10),
      };
      const { data: specBatchId } = await getSpecBatchId(body);

      const reqBody = {
        functionName: "getCurrSemester",
      };

      this.setState({ timetableData: [] });
      const { data: timetableData } = await getSpecBatchTTData(
        specBatchId,
        reqBody
      );

      const messageData = {
        specName: spec.name,
        year: batch.year,
        semester: batch.semester,
        timePeriod: `${timetableData[0].currSemester.year} ${timetableData[0].currSemester.semester.periodName}`,
      };

      this.setState({ messageData });
      this.setState({ timetableData });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.setState({ timetableData: [] });
      }
    }
  };

  schema = {
    specilizationId: Joi.string().required().label("Specialization field"),
    batchId: Joi.string().required().label("Batch field"),
  };
  render() {
    const { timetableData } = this.state;
    return (
      <div className="container-fluid">
        <h3 className="text-center text-dark">Admin Original Timetables</h3>
        <div className="row">
          <div className="col-3 mx-3 d-flex flex-column">
            <div className="form-container mt-5" style={{ width: "100%" }}>
              <form onSubmit={this.handleSubmit}>
                <div
                  className="row"
                  data-intro="View the reschedule timetable filtered by selected module."
                >
                  {this.renderSelect(
                    "specilizationId",
                    "Specialization",
                    "name",
                    this.state.specilizations,
                    true,
                    false
                  )}
                  {this.renderSelect(
                    "batchId",
                    "Batch",
                    "name",
                    this.state.batches,
                    true,
                    false
                  )}
                </div>
                <div className="mt-4">
                  {this.renderButton(
                    <span>
                      Search <i className="fa fa-search" aria-hidden="true"></i>
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
          <div
            className={`col ${
              timetableData.length === 0 ? "" : "mt-5"
            } d-flex flex-column justify-content-center align-items-center`}
          >
            {timetableData.length === 0 ? (
              <div className="">
                <img src={TTLoading} alt="Loading" />
              </div>
            ) : (
              <div>
                <div id="timetable-grid">
                  <TimetableGrid
                    timetableData={timetableData}
                    messageData={this.state.messageData}
                  />
                </div>
                <div className="d-flex justify-content-end me-3 mt-4">
                  <button
                    className="btn btn-primary custom-button"
                    onClick={this.handleDownload}
                  >
                    {<i className="fa fa-download" aria-hidden="true"></i>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default AdminTimetables;
