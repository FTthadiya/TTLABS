import React, { Component } from "react";
import TimetableGrid from "../Common/TimetableGrid";
import TTLoading from "../../../assets/timetableManagement/TimetableLoading.png";
import Joi from "joi-browser";
import Form from "../Common/Form";
import {
  getSpecNames,
  getBatchNames,
  getSpecBatchId,
} from "./../Services/SpecBatchService";
import {
  getUniqueYears,
  getPreviousTimetables,
} from "./../Services/TimetableService";
import "../Css/form.css";

class PrevTimetables extends Form {
  state = {
    data: { specilizationId: "", batchId: "", yearId: "", semesterId: "" },
    errors: {},
    specilizations: [],
    batches: [],
    years: [],
    semesters: [],
    timetableData: [],
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
      const { data: years } = await getUniqueYears();
      let yearWithId = years.map((year, index) => {
        return {
          _id: index,
          year: year,
        };
      });
      const semesters = [
        {
          _id: 1,
          periodName: "February - June",
        },
        {
          _id: 2,
          periodName: "July - November",
        },
      ];
      this.setState({
        specilizations: specWithId,
        batches: batchWithId,
        years: yearWithId,
        semesters,
      });
    } catch (error) {
      console.log("Error in retrieving data", error);
    }
  }

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

      const selectYear = this.state.years.find((y) => {
        return y._id.toString() === data.yearId.toString();
      });

      console.log("Selected Year", selectYear);

      const reqBody = {
        specBatchId: specBatchId,
        selectedYear: selectYear.year,
        selectedSemester: data.semesterId,
      };

      this.setState({ timetableData: [] });
      const { data: timetableData } = await getPreviousTimetables(reqBody);
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
    yearId: Joi.string().required().label("Year field"),
    semesterId: Joi.string().required().label("Semester field"),
  };

  render() {
    const { timetableData } = this.state;
    return (
      <div className="container-fluid">
        <h3 className="text-center text-dark">Previous Timetables</h3>
        <div className="row">
          <div className="col-3 mx-3 d-flex flex-column">
            <div className="form-container mt-5" style={{ width: "100%" }}>
              <form onSubmit={this.handleSubmit}>
                <div className="row">
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
                  {this.renderSelect(
                    "yearId",
                    "Year",
                    "year",
                    this.state.years,
                    true,
                    false
                  )}
                  {this.renderSelect(
                    "semesterId",
                    "Semester",
                    "periodName",
                    this.state.semesters,
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
              <TimetableGrid timetableData={timetableData} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default PrevTimetables;
