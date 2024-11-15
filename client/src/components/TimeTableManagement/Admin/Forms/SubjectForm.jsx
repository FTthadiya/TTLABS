import React, { Component } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Joi from "joi-browser";
import { getLecturers } from "../../Services/LecturerService";
import { getSpecBatches } from "../../Services/SpecBatchService";
import { saveSubject } from "../../Services/SubjectService";
import Form from "../../Common/Form";
import BatchSelector from "./BatchSelector";
import SuccessAlert from "../../Common/SuccessAlert";
import "../../Css/form.css";

const SubjectFormWrapper = (props) => {
  const navigate = useNavigate();
  return <SubjectForm navigate={navigate} {...props} />;
};

class SubjectForm extends Form {
  state = {
    data: {
      subjectName: "",
      subjectCode: "",
      duration: "",
      studentCount: "",
      lecturerId: "",
      sessionType: "",
      subSessionDuration: "",
      subLecturerId: "",
      selectedBatches: [],
    },
    errors: {},
    lecturers: [],
    batches: [],
    sessionTypes: [],
    navigate: null,
  };

  async componentDidMount() {
    this.handleLecturerAssign();
    this.handleBatchesAssign();
    const sessionTypes = [
      { _id: 1, name: "Lab" },
      { _id: 2, name: "Tute" },
      { _id: 3, name: "Workshop" },
      { _id: 4, name: "Seminar" },
    ];
    this.setState({ sessionTypes });

    const { navigate } = this.props;
    this.setState({ navigate });
  }

  handleLecturerAssign = async () => {
    const { data } = await getLecturers();
    this.setState({ lecturers: data });
  };

  handleBatchesAssign = async () => {
    const { data } = await getSpecBatches();
    this.setState({ batches: data });
  };

  schema = {
    _id: Joi.string(),
    subjectName: Joi.string().required().label("Subject Name"),
    subjectCode: Joi.string().required().label("Subject Code"),
    duration: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .label("Lecture Duration"),
    studentCount: Joi.number()
      .integer()
      .min(1)
      .max(150)
      .required()
      .label("Student Count"),
    lecturerId: Joi.string().required().label("Lecturer"),
    sessionType: Joi.string().required().label("Session Type"),
    subSessionDuration: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .label("Sub session Duration"),
    subLecturerId: Joi.label("Sub Lecturer"),
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
      const { data, sessionTypes, navigate } = this.state;
      const mainSession = {
        subjectName: data.subjectName,
        subjectCode: data.subjectCode,
        sessionType: "Lecture",
        studentCount: data.studentCount,
        duration: data.duration,
        lecturerId: data.lecturerId,
        specBatchesIds: data.selectedBatches.map((sb) => sb._id),
      };

      const subSession = {
        subjectName: data.subjectName,
        subjectCode: data.subjectCode,
        sessionType: sessionTypes[data.sessionType - 1].name,
        studentCount: data.studentCount,
        duration: data.subSessionDuration,
        lecturerId: data.subLecturerId ? data.subLecturerId : data.lecturerId,
        specBatchesIds: data.selectedBatches.map((sb) => sb._id),
      };
      await saveSubject(mainSession);
      await saveSubject(subSession);

      SuccessAlert("Subject and Sub session saved successfully.");
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
    const { lecturers, sessionTypes, batches, data } = this.state;
    return (
      <div>
        <h3 className="text-center text-dark">Subject Form</h3>
        <br />
        <main className="container mx-auto mt-5">
          <div className="form-container">
            <form onSubmit={this.handleSubmit}>
              {this.renderInput("subjectName", "Subject Name")}
              {this.renderInput("subjectCode", "Subject Code")}
              {this.renderInput("duration", "Lecture Duration (in Hours)")}
              {this.renderInput("studentCount", "Student Count")}
              {this.renderSelect(
                "lecturerId",
                "Lecturer",
                "lecturerName",
                lecturers
              )}
              <br />
              <hr />
              <br />
              {this.renderSelect(
                "sessionType",
                "Session Type",
                "name",
                sessionTypes
              )}
              {this.renderInput(
                "subSessionDuration",
                "Sub Session Duration (in Hours)"
              )}
              <p className="text-primary">
                {
                  <i
                    className="fa fa-exclamation-circle text-primary"
                    aria-hidden="true"
                  ></i>
                }{" "}
                If the same lecturer is conducting the Lab,Tute,Workshop or
                Seminar, field below is not required.
              </p>
              {this.renderSelect(
                "subLecturerId",
                "Substitute Lecturer",
                "lecturerName",
                lecturers
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
                {this.renderButton("Submit")}
              </div>
              <br />
            </form>
          </div>
        </main>
      </div>
    );
  }
}

export default SubjectFormWrapper;
