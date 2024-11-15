import React from "react";

const Select = ({
  name,
  label,
  path,
  options,
  error,
  isList,
  showErrors,
  ...rest
}) => {
  const renderLabel = () => {
    return (
      <label htmlFor={name} className="form-label text-dark">
        {label}
      </label>
    );
  };

  const renderSelect = () => {
    return (
      <select
        name={name}
        id={name}
        {...rest}
        style={{
          backgroundColor: "#F9FBE7",
          ...(showErrors &&
            error && { borderColor: "#ff002d", borderWidth: 2 }),
        }}
        className="form-select text-dark"
      >
        <option value="" />
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option[path]}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="form-group">
      {isList ? (
        <>
          <div className="row g-3 align-items-center">
            <div className="col-md-3">{renderLabel()}</div>
          </div>
          <div className="row g-3 align-items-center mb-3">
            <div className="col">{renderSelect()}</div>
          </div>
          {error && showErrors && (
            <label className="text-danger">{error}</label>
          )}
        </>
      ) : (
        <div className="row g-3 align-items-center mb-3">
          <div className="col-md-3">{renderLabel()}</div>
          <div className="col">{renderSelect()}</div>
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
};

export default Select;
