import React from "react";

function ToggleBtn(props) {
  return (
    <div className="form-check form-switch form-check-reverse text-start">
      <input
        className="form-check-input"
        type="checkbox"
        id="flexSwitchCheckReverse"
        style={{ cursor: "pointer" }}
        checked={props.toggled}
        onChange={props.onToggle}
      />
      <label className="form-check-label" htmlFor="flexSwitchCheckReverse">
        Enable Lecturer Preference
      </label>
    </div>
  );
}

export default ToggleBtn;
