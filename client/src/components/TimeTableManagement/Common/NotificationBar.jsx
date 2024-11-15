import React from "react";

function NotificationBar(props) {
  return (
    <div
      className="container-fluid d-flex justify-content-end"
      style={{ paddingBottom: 10, paddingTop: 20 }}
    >
      <button
        type="button"
        className="btn btn-primary position-relative me-3"
        style={{
          background: "linear-gradient(to right, #FFFFFF, #5CD6E0)",
          borderWidth: 0,
          color: "#000000",
        }}
      >
        <i className="fa fa-bell fa-fw" aria-hidden="true"></i>
        <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle">
          <span className="visually-hidden">New alerts</span>
        </span>
      </button>
    </div>
  );
}

export default NotificationBar;
