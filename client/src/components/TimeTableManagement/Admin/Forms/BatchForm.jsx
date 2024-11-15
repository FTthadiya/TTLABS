import React, { Component } from "react";
import { toast } from "react-toastify";
import { saveBatch, getSpecNames } from "../../Services/SpecBatchService";
import { useNavigate } from "react-router-dom";
import Joi from "joi-browser";
import Form from "../../Common/Form";
import SuccessAlert from "./../../Common/SuccessAlert";
import "../../Css/form.css";

const BatchFormWrapper = (props) => {
  const navigate = useNavigate();
  return <BatchForm navigate={navigate} {...props} />;
};
class BatchForm extends Form {
  state = {
    data: { selectedSpec: "", specName: "", year: "", semester: "" },
    errors: {},
    specializations: [],
    isOther: false,
    navigate: null,
  };

  componentDidMount() {
    const navigate = this.props.navigate;
    this.setState({ navigate });

    this.handleSpecAssign();
  }

  componentDidUpdate(prevProps, prevState) {
    const { specializations } = this.state;
    let { data } = this.state;
    const prevSelectedSpec = prevState.data.selectedSpec;
    const currSelectedSpec = data.selectedSpec;

    if (prevSelectedSpec !== currSelectedSpec) {
      const selectedSpecObj = specializations.find(
        (spec) => spec._id.toString() === currSelectedSpec.toString()
      );

      if (selectedSpecObj && selectedSpecObj.specName === "Other") {
        data = { ...data, specName: "" };
        this.setState({ data, isOther: true });
      } else {
        const specName = selectedSpecObj ? selectedSpecObj.specName : "";
        data = { ...data, specName };
        this.setState({ data, isOther: false });
      }
    }
  }

  handleSpecAssign = async () => {
    const { data } = await getSpecNames();
    const receivedSpecs = data.map((spec, index) => ({
      _id: index,
      specName: spec,
    }));
    receivedSpecs.push({ _id: receivedSpecs.length, specName: "Other" });
    this.setState({ specializations: receivedSpecs });
  };

  schema = {
    _id: Joi.string(),
    selectedSpec: Joi.label("Select Specilization"),
    specName: Joi.string().required().min(3).label("Specilization Name"),
    year: Joi.number().integer().min(1).max(5).required().label("Year"),
    semester: Joi.number().integer().min(1).max(2).required().label("Semester"),
  };

  doSubmit = async () => {
    const { data, navigate } = this.state;
    let batchObj = { ...data };
    delete batchObj.selectedSpec;
    try {
      await saveBatch(batchObj);
      SuccessAlert("Batch added successfully.");
      navigate("/specilization-management");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (
          error.response.data ===
          "Specialization batch with the same details already exists."
        ) {
          toast.warning("Batch with the same details already exists.");
        } else {
          toast.error("Something went wrong.");
        }
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  render() {
    const { specializations, isOther } = this.state;
    return (
      <div>
        <h3 className="text-center text-dark">Batch Form</h3>
        <br />
        <main className="container mx-auto mt-5">
          <div className="form-container">
            <form onSubmit={this.handleSubmit}>
              <div className="mb-4">
                {this.renderSelect(
                  "selectedSpec",
                  "Select Specilization",
                  "specName",
                  specializations
                )}
              </div>
              <div className={`${isOther ? "show-div" : "hide-div"} mb-4`}>
                {this.renderInput("specName", "Specilization Name")}
              </div>
              {this.renderInput("year", "Course Year")}
              <div className="my-4">
                {this.renderInput("semester", "Semester")}
              </div>
              <div className="d-flex justify-content-end">
                {this.renderButton("Submit")}
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }
}

export default BatchFormWrapper;
