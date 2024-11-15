import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

import _ from "lodash";
import TimetableGrid from "../Common/TimetableGrid";
import Form from "./../Common/Form";
import Joi from "joi-browser";
import {
  getSpecNames,
  getBatchNames,
  getSpecBatchId,
} from "./../Services/SpecBatchService";
import { getSpecBatchTTData } from "../Services/TimetableService";
import TTLoading from "../../../assets/timetableManagement/TimetableLoading.png";
import "../Css/form.css";
import NotificationBar from "../../NotificationManagement/NotificationBar";
import axios from "axios";

class AdminHome extends Form {
  constructor(props) {
    super(props);
  }

  state = {
    data: { specilizationId: "", batchId: "" },
    errors: {},
    specilizations: [],
    batches: [],
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

      this.setState({ specilizations: specWithId, batches: batchWithId });
    } catch (error) {
      console.log(error);
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

      const reqBody = {
        functionName: "getCurrSemester",
      };

      this.setState({ timetableData: [] });
      // const { data: timetableData } = await getSpecBatchTTData(
      //   specBatchId,
      //   reqBody
      // );
      const { data: timetableData } = await axios.post(
        "http://localhost:3001/api/resTimetable/specBatch/" + specBatchId._id,
        reqBody
      );

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

  navigateToRes() {}

  render() {
    const { timetableData } = this.state;

    return (
      <div className="container-fluid">
        {this.props.user && (
          <NotificationBar
            setPreviewId={this.navigateToRes}
            user={this.props.user}
          />
        )}
        <div className="row">
          <div className="col-3 mx-3 d-flex flex-column">
            <div
              className="form-container mt-5"
              style={{ width: "100%" }}
              data-intro="Search the timetable based on selected Specialization and Batch"
            >
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
              <div>
                <img src={TTLoading} alt="Loading" />
              </div>
            ) : (
              <TimetableGrid
                timetableData={timetableData}
                data-intro="To view timetable based on specialization and batch"
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default AdminHome;
