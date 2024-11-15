import React, { Component } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { saveBatch, getSpecNames } from "../../Services/SpecBatchService";
import Joi from "joi-browser";
import Form from "../../Common/Form";
import "../../Css/form.css";
import SuccessAlert from "./../../Common/SuccessAlert";

const SpecilizationFormWrapper = (props) => {
  const navigate = useNavigate();
  return <SpecilizationForm navigate={navigate} {...props} />;
};

class SpecilizationForm extends Form {
  state = {
    data: { selectedSpec: "", specName: "", courseDuration: "" },
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
    selectedSpec: Joi.label("Select Specialization"),
    specName: Joi.string().required().label("Specilization Name"),
    courseDuration: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .label("Course Duration"),
  };

  doSubmit = async () => {
    const { data, navigate } = this.state;
    let batches = [];
    let successReq = 0;
    let failedReq = 0;
    const firstSem = 1;
    const secondSem = 2;

    for (let i = 1; i <= data.courseDuration; i++) {
      const semOne = {
        specName: data.specName,
        year: i,
        semester: firstSem,
      };
      const semTwo = {
        specName: data.specName,
        year: i,
        semester: secondSem,
      };
      batches.push(semOne);
      batches.push(semTwo);
    }
    for (let batch of batches) {
      try {
        await saveBatch(batch);
        successReq++;
      } catch (error) {
        if (error.response && error.response.status === 400) {
          if (
            error.response.data ===
            "Specialization batch with the same details already exists."
          )
            failedReq++;
        }
      }
    }
    if (successReq > 0 || failedReq > 0) {
      if (successReq > 0 && failedReq === 0) {
        SuccessAlert(`${successReq} Batches successfully added.`);
      } else if (successReq > 0 && failedReq > 0) {
        SuccessAlert(`${successReq} Batches successfully added.`);
        toast.warning(`${failedReq} Batches already exists.`);
      } else if (successReq === 0 && failedReq > 0) {
        toast.warning(`${failedReq} Batches already exists.`);
      }
      navigate("/specilization-management");
    } else {
      toast.error("Something went wrong. Please try again.");
      navigate("/specilization-management");
    }
  };

  render() {
    const { specializations, isOther } = this.state;
    return (
      <div>
        <h3 className="text-center text-dark">Specialization Form</h3>
        <br />
        <main className="container mx-auto mt-5">
          <div className="form-container">
            <form onSubmit={this.handleSubmit}>
              <div className="mb-4">
                {this.renderSelect(
                  "selectedSpec",
                  "Select Specialization",
                  "specName",
                  specializations
                )}
              </div>
              <div className={`${isOther ? "show-div" : "hide-div"} mb-4`}>
                {this.renderInput("specName", "Specialization Name")}
              </div>
              {this.renderInput("courseDuration", "Course Duration")}
              <div className="d-flex justify-content-end mt-4">
                {this.renderButton("Submit")}
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }
}

export default SpecilizationFormWrapper;
