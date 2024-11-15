import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./ClassManagement.css";
import HallManagement from "../halls/HallManagement";
import LabManagement from "../labs/LabManagement";
import ViewHalls from "../halls/ViewHalls";
import AssignHall from "../halls/AssignHall";

function ClassManagement() {
  
  const [selectedHallType, setSelectedHallType] = useState("");

  return (
    <div>
        <div className="App">         
                <div className="Main">
                  <h3 className="TypeHeading text-dark">
                    Select Hall Type
                  </h3>
                  <select
                    value={selectedHallType}
                    onChange={(e) => setSelectedHallType(e.target.value)}
                    className="DropdownBox"
                  >
                    <option value="">Select Hall Type</option>
                    <option value="lectureHall">Lecture Hall</option>
                    <option value="laboratory">Laboratory</option>
                  </select>
                  {selectedHallType === "lectureHall" && <HallManagement />}
                  {selectedHallType === "laboratory" && <LabManagement />}
                </div>
        </div>
    </div>
  );
}

export default ClassManagement;
