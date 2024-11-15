import React, { Component } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import Joi from "joi-browser";
import { getLecturers } from "../../Services/LecturerService";
import { getSpecBatches } from "../../Services/SpecBatchService";
import { getSubject, saveSubject } from "../../Services/SubjectService";
import Form from "../../Common/Form";
import BatchSelector from "./BatchSelector";
import SuccessAlert from "./../../Common/SuccessAlert";
import "../../Css/form.css";

const SubjectManageFormWrapper = (props) => {
  const { id: subjectId } = useParams();
  const navigate = useNavigate();
  return (
    <SubjectManageForm subjectId={subjectId} navigate={navigate} {...props} />
  );
};

class SubjectManageForm extends Form {
  state = {
    data: {
      subjectName: "",
      subjectCode: "",
      sessionType: "",
      studentCount: "",
      duration: "",
      lecturerId: "",
      selectedBatches: [],
    },
    errors: {},
    lecturers: [],
    batches: [],
    sessionTypes: [],
    isNewSession: false,
    navigate: null,
  };

  async componentDidMount() {
    const { data: lecturers } = await getLecturers();
    const { data: batches } = await getSpecBatches();
    const sessionTypes = [
      { _id: 1, name: "Lecture" },
      { _id: 2, name: "Lab" },
      { _id: 3, name: "Tute" },
      { _id: 4, name: "Workshop" },
      { _id: 5, name: "Seminar" },
    ];
    this.setState({ lecturers, sessionTypes });
    const navigate = this.props.navigate;
    this.setState({ navigate });

    const subjectId = this.props.subjectId;
    if (subjectId === "new-session") {
      this.setState({ batches, isNewSession: true });
      return;
    }

    const { data: subject } = await getSubject(subjectId);
    if (!subject) return this.props.history.replace("/subject-management");

    this.setState({ data: this.mapToViewModel(subject) });
    const { selectedBatches } = this.state.data;
    const newBatches = batches.filter(
      (sb) => !selectedBatches.find((s) => s._id === sb._id)
    );
    this.setState({ batches: newBatches });
  }

  mapToViewModel(subject) {
    const { sessionTypes } = this.state;
    const selectedSessionType = sessionTypes.find(
      (st) => st.name === subject.sessionType
    );
    return {
      _id: subject._id,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      sessionType: selectedSessionType._id.toString(),
      studentCount: subject.studentCount,
      duration: subject.duration,
      lecturerId: subject.lecturer._id,
      selectedBatches: subject.specBatches,
    };
  }

  schema = {
    _id: Joi.string(),
    subjectName: Joi.string().required().label("Subject Name"),
    subjectCode: Joi.string().required().label("Subject Code"),
    sessionType: Joi.string().required().label("Session Type"),
    studentCount: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .required()
      .label("Student Count"),
    duration: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .label("Lecture Duration"),
    lecturerId: Joi.string().required().label("Lecturer"),
    selectedBatches: Joi.array().label("Batches"),
  };

  handleAdd = (specBatch) => {
    let { batches, data } = this.state;
    let { selectedBatches } = this.state.data;

    const newSelectedBatches = [...selectedBatches, specBatch];
    data.selectedBatches = newSelectedBatches;
    const newBatches = batches.filter((sb) => sb._id !== specBatch._id);

    this.setState({ data, batches: newBatches });
  };

  handleDelete = (specBatch) => {
    let { batches, data } = this.state;
    let { selectedBatches } = this.state.data;

    const newSelectedBatches = selectedBatches.filter(
      (sb) => sb._id !== specBatch._id
    );
    data.selectedBatches = newSelectedBatches;
    const newBatches = [...batches, specBatch];

    this.setState({ data, batches: newBatches });
  };

  doSubmit = async () => {
    try {
      const { data, sessionTypes, navigate, isNewSession } = this.state;
      const session = sessionTypes.find(
        (st) => st._id.toString() === data.sessionType
      );
      const specBatchesIds = data.selectedBatches.map((sb) => sb._id);
      let subject = data;
      subject.sessionType = session.name;
      subject.specBatchesIds = specBatchesIds;

      await saveSubject(subject);
      if (isNewSession) {
        SuccessAlert("Session saved successfully.");
      } else {
        SuccessAlert("Subject updated successfully.");
      }

      navigate("/subject-management");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (
          error.response.data ===
          "Subject with the same details already exists."
        ) {
          toast.error(error.response.data);
        } else {
          toast.error("Error occured while saving the subject.");
        }
      } else {
        toast.error("Error occured while saving the subject.");
      }
    }
  };

  render() {
    const { lecturers, sessionTypes, batches, data, isNewSession } = this.state;
    return (
      <div>
        <h3 className="text-center text-dark">
          {isNewSession ? "Add Session" : "Update Subject Details"}
        </h3>
        <br />
        <main className="container mx-auto mt-5">
          <div className="form-container">
            <form onSubmit={this.handleSubmit}>
              {this.renderInput("subjectName", "Subject Name")}
              {this.renderInput("subjectCode", "Subject Code")}
              {this.renderInput("duration", "Duration (in Hours)")}
              {this.renderInput("studentCount", "Student Count")}
              {this.renderSelect(
                "lecturerId",
                "Lecturer",
                "lecturerName",
                lecturers
              )}
              {this.renderSelect(
                "sessionType",
                "Session Type",
                "name",
                sessionTypes
              )}
              <br />
              <hr />
              <br />
              <BatchSelector
                batches={batches}
                selectedBatches={data.selectedBatches}
                onAdd={this.handleAdd}
                onDelete={this.handleDelete}
              />
              <div className="d-flex justify-content-end">
                {this.renderButton({ isNewSession } ? "Submit" : "Update")}
              </div>
              <br />
            </form>
          </div>
        </main>
      </div>
    );
  }
}

export default SubjectManageFormWrapper;
