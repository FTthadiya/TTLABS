import React, { Component } from "react";
import _ from "lodash";
import Form from "../Common/Form";
import Joi, { errors } from "joi-browser";
import { getLecturerSubjects } from "./../Services/SubjectService";
import {
  getDays,
  getAllTimes,
  getTimes,
} from "./../Services/DaysAndTimeService";
import { saveLecturerPreference } from "../Services/LecturerPreferenceService";
import { toast } from "react-toastify";
import "../Css/form.css";
import SuccessAlert from "../Common/SuccessAlert";

const LecturerPrefFormWrapper = (props) => {
  return <LecturerPrefForm {...props} />;
};

class LecturerPrefForm extends Form {
  state = {
    data: {
      subjectId: "",
      dayOne: "",
      dayTwo: "",
      dayThree: "",
      dayFour: "",
      dayFive: "",
      timeOne: "",
      timeTwo: "",
      timeThree: "",
      timeFour: "",
      timeFive: "",
    },
    initData: {},
    duration: "",
    units: [],
    days: [],
    times: [],
    errors: {},
    user: {},
  };

  async componentDidMount() {
    const { data } = this.state;

    await this.setState({ user: this.props.user });
    await this.assignSubjects(this.state.user.userId);

    this.setState({ initData: data });
  }

  assignSubjects = async (lecturerId) => {
    const { data } = await getLecturerSubjects(lecturerId);
    const subjects = data
      .filter(
        (subject) => subject.specBatches && subject.specBatches.length > 0
      )
      .map((subject) => ({
        _id: subject._id,
        name: `${subject.subjectName} (${subject.subjectCode}) | ${subject.sessionType}`,
        duration: subject.duration,
      }));
    this.setState({ units: subjects });
  };

  async componentDidUpdate(prevProps, prevState) {
    const { data, errors, initData } = this.state;

    if (prevState.data.subjectId !== data.subjectId) {
      if (data.subjectId === "") {
        const filteredErrors = this.filterErrorsByUnitId(errors);
        this.setState({
          data: { ...initData },
          duration: "",
          days: [],
          times: [],
          errors: filteredErrors,
        });
      } else {
        const unit = this.state.units.find((u) => u._id === data.subjectId);
        this.setState({ duration: unit.duration });
        const days = await this.assignDays();
        const allTimes = await this.assignTimes();
        const times = await getTimes(allTimes, unit.duration);
        this.setState({ days, times });
      }
    }

    const message = "Combination of day and start time is equal to another";
    let include = true;
    if (prevState.errors != errors) {
      const prevFilteredErrors = this.filterErrorsByMessage(
        prevState.errors,
        message,
        include
      );
      const filteredErrors = this.filterErrorsByMessage(
        errors,
        message,
        include
      );
      if (!_.isEqual(prevFilteredErrors, filteredErrors)) {
        const newErrors = this.customErrors();
        include = false;
        const noEqualErrors = this.filterErrorsByMessage(
          errors,
          message,
          false
        );

        if (Object.keys(noEqualErrors).length > 0) {
          this.setState({ errors: noEqualErrors });
        } else {
          this.setState({ errors: newErrors });
        }
      }
    }
  }

  assignDays = async () => {
    const { data } = await getDays();
    const days = data.map((day) => ({
      _id: day._id,
      name: day.name,
    }));
    return days;
  };

  assignTimes = async () => {
    const { data } = await getAllTimes();
    const times = data.map((time) => ({
      _id: time._id,
      name: time.name,
    }));
    return times;
  };

  filterErrorsByMessage = (errors, message, include) => {
    return Object.keys(errors).reduce((acc, key) => {
      if (include === true) {
        if (errors[key] === message) {
          acc[key] = errors[key];
        }
        return acc;
      } else {
        if (errors[key] !== message) {
          acc[key] = errors[key];
        }
        return acc;
      }
    }, {});
  };

  filterErrorsByUnitId = (errors) => {
    return Object.keys(errors).reduce((acc, key) => {
      if (key.includes("subjectId")) {
        acc[key] = errors[key];
      }
      return acc;
    }, {});
  };

  schema = {
    subjectId: Joi.string().required().label("Unit field"),
    dayOne: Joi.string().required().label("Day field"),
    dayTwo: Joi.string().required().label("Day field"),
    dayThree: Joi.string().required().label("Day field"),
    dayFour: Joi.string().required().label("Day field"),
    dayFive: Joi.string().required().label("Day field"),
    timeOne: Joi.string().required().label("Time field"),
    timeTwo: Joi.string().required().label("Time field"),
    timeThree: Joi.string().required().label("Time field"),
    timeFour: Joi.string().required().label("Time field"),
    timeFive: Joi.string().required().label("Time field"),
  };

  customErrors = () => {
    const { data } = this.state;
    let errors = {};
    const message = "Combination of day and start time is equal to another";

    const dataArr = [
      { dayOne: data.dayOne, timeOne: data.timeOne },
      { dayTwo: data.dayTwo, timeTwo: data.timeTwo },
      { dayThree: data.dayThree, timeThree: data.timeThree },
      { dayFour: data.dayFour, timeFour: data.timeFour },
      { dayFive: data.dayFive, timeFive: data.timeFive },
    ];

    outerloop: for (let i = 0; i < dataArr.length; i++) {
      for (let j = i + 1; j < dataArr.length; j++) {
        const valueI = _.values(dataArr[i]);
        const valueJ = _.values(dataArr[j]);
        if (_.isEqual(valueI, valueJ)) {
          errors = {
            ...errors,
            [Object.keys(dataArr[i])[0]]: message,
            [Object.keys(dataArr[i])[1]]: message,
          };
          errors = {
            ...errors,
            [Object.keys(dataArr[j])[0]]: message,
            [Object.keys(dataArr[j])[1]]: message,
          };
          break outerloop;
        }
      }
    }
    this.setState({ errors });
    return errors;
  };

  doSubmit = async () => {
    const errors = this.customErrors();
    this.setState({ errors: errors || {} });
    if (Object.keys(errors).length > 0) return;

    try {
      const { data } = this.state;
      const dayTimeKeys = ["One", "Two", "Three", "Four", "Five"];
      let daysStartTimesIds = [];

      dayTimeKeys.forEach((key) => {
        daysStartTimesIds.push({
          dayId: data[`day${key}`],
          startTimeId: data[`time${key}`],
        });
      });
      const lecturerPreferenceObj = {
        subjectId: data.subjectId,
        daysStartTimesIds: [...daysStartTimesIds],
      };
      await saveLecturerPreference(lecturerPreferenceObj);
      this.setState({ data: { ...this.state.initData } });
      SuccessAlert("Your Preference saved successfully.");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (
          error.response.data ===
          "Lecturer preference with the same details already exists."
        ) {
          toast.error(error.response.data);
        } else {
          toast.error("Error occured while saving the Lecturer Preference.");
        }
      } else {
        toast.error("Error occured while saving the Lecturer Preference.");
      }
    }
  };

  render() {
    return (
      <div>
        <h3 className="text-center text-dark">Lecturer Preference</h3>
        <br />
        <main className="container mx-auto">
          <div className="row">
            <div className="col-3 mt-5">
              <div
                className="form-container"
                style={{ width: "100%", margin: "0" }}
              >
                {this.renderSelect(
                  "subjectId",
                  "Unit",
                  "name",
                  this.state.units,
                  true,
                  false
                )}
              </div>
              <br />
              {this.state.data.subjectId !== "" && (
                <div className="card text-center form-container">
                  <div
                    className="card-header"
                    style={{ paddingTop: "20px", paddingBottom: "20px" }}
                  >
                    <h5 className="card-title">Duration</h5>
                  </div>
                  <div className="card-body">
                    <h1 className="card-text" style={{ fontWeight: "bolder" }}>
                      {this.state.data.subjectId !== "" && this.state.duration}
                    </h1>
                    <p>Hour</p>
                  </div>
                </div>
              )}
            </div>
            <div
              className="col form-container ms-4 mt-5"
              style={{ width: "100%" }}
            >
              <div style={{ marginInline: "20px" }}>
                <form onSubmit={this.handleSubmit}>
                  <div className="row align-items-center">
                    <div className="row">
                      <div className="col">
                        {this.renderSelect(
                          "dayOne",
                          "Day",
                          "name",
                          this.state.days
                        )}
                      </div>
                      <div className="col">
                        {this.renderSelect(
                          "timeOne",
                          "Start Time",
                          "name",
                          this.state.times
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="row">
                      <div className="col">
                        {this.renderSelect(
                          "dayTwo",
                          "Day",
                          "name",
                          this.state.days
                        )}
                      </div>
                      <div className="col">
                        {this.renderSelect(
                          "timeTwo",
                          "Start Time",
                          "name",
                          this.state.times
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="row">
                      <div className="col">
                        {this.renderSelect(
                          "dayThree",
                          "Day",
                          "name",
                          this.state.days
                        )}
                      </div>
                      <div className="col">
                        {this.renderSelect(
                          "timeThree",
                          "Start Time",
                          "name",
                          this.state.times
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="row">
                      <div className="col">
                        {this.renderSelect(
                          "dayFour",
                          "Day",
                          "name",
                          this.state.days
                        )}
                      </div>
                      <div className="col">
                        {this.renderSelect(
                          "timeFour",
                          "Start Time",
                          "name",
                          this.state.times
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="row">
                      <div className="col">
                        {this.renderSelect(
                          "dayFive",
                          "Day",
                          "name",
                          this.state.days
                        )}
                      </div>
                      <div className="col">
                        {this.renderSelect(
                          "timeFive",
                          "Start Time",
                          "name",
                          this.state.times
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end me-4">
                    {this.renderButton("Submit")}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default LecturerPrefFormWrapper;
