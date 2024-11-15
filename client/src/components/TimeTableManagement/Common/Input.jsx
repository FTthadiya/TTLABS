import React from "react";

function Input({ name, label, error, isList, showErrors, ...rest }) {
  const renderLabel = () => {
    return (
      <label htmlFor={name} className="form-label text-dark">
        {label}
      </label>
    );
  };

  const renderInput = () => {
    return (
      <input
        {...rest}
        name={name}
        id={name}
        className="form-control text-dark"
        style={{
          backgroundColor: "#F9FBE7",
          ...(showErrors &&
            error && { borderColor: "#ff002d", borderWidth: 2 }),
        }}
      />
    );
  };

  return (
    <div className="form-group">
      {isList ? (
        <>
          <div className="row g-3 align-items-center">
            <div className="col-md-3">{renderLabel()}</div>
          </div>
          <div className="row g-3 align-items-center">
            <div className="col">{renderInput()}</div>
          </div>
          {error && showErrors && (
            <label className="text-danger">{error}</label>
          )}
        </>
      ) : (
        <div className="row g-3 align-items-center mb-3">
          <div className="col-md-3">{renderLabel()}</div>
          <div className="col">{renderInput()}</div>
          <div className="row">
            <div className="col-md-auto offset-md-3">
              {error && showErrors && (
                <label className="text-danger">{error}</label>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Input;
