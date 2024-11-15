import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddPopupL from "./AddPopupL";
import DeletePopupL from "./DeletePopupL";
import UpdatePopupL from "./UpdatePopupL";
import LogPopupL from "./LogPopupL";
import assignLab from "./AssignLab";
import Axios from 'axios';


function LabManagement() {
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false); 
  const navigate = useNavigate();
  const [initialFilteredTimetables, setInitialFilteredTimetables] = useState([]);
  const [showLogPopup, setShowLogPopup] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const [filteredTimetables, setFilteredTimetables] = useState([]); 

  // useEffect(() => {
  //   Axios.get("http://localhost:3001/api/timetables").then((response) => {
  //     const initialFiltered = response.data.filter(timetable => !timetable.lectureHall.assigned && timetable.subject.sessionType === "Lab");
  //     setInitialFilteredTimetables(initialFiltered);
  //     setFilteredTimetables(initialFiltered);
  //   });
  // }, []);

  const handleAssignLabs = async () => {
    const response = await Axios.get("http://localhost:3001/api/timetables");
    const allTimetables = response.data;
  
    const initialFiltered = allTimetables.filter(timetable => !timetable.lectureHall.assigned && timetable.subject.sessionType === "Lab");
    setInitialFilteredTimetables(initialFiltered);
  
    const messages = [];
    for (const timetable of initialFiltered) {
      try {
        const message = await assignLab(timetable);
        messages.push(message);
      } catch (error) {
        console.error('Error assigning Lab:', error);
        messages.push('Error assigning Lab for timetable ID ' + timetable._id);
      }
    }
    const allAssigned = initialFiltered.every(timetable => timetable.lectureHall.assigned);
    if (allAssigned) {
      messages.push('All subjects have a Lab assigned');
    }
    setLogMessages(messages); 
    setShowLogPopup(true); 
  };

  const closeLogPopup = () => {
    setShowLogPopup(false);
  };

  const handleAddLab = () => {
    setShowAddPopup(true);
    setButtonDisabled(true); // Disable buttons when popup is opened
  };

  const handleClosePopup = () => {
    setShowAddPopup(false);
    setButtonDisabled(false); // Enable buttons when popup is closed
  };

  const handleDeleteLab = () => {
    setShowDeletePopup(true);
    setButtonDisabled(true); // Disable buttons when popup is opened
  };

  const handleCloseDeletePopup = () => {
    setShowDeletePopup(false);
    setButtonDisabled(false); // Enable buttons when popup is closed
  };

  const handleUpdateLab = () => {
    setShowUpdatePopup(true);
    setButtonDisabled(true); // Disable buttons when popup is opened
  };

  const handleCloseUpdatePopup = () => {
    setShowUpdatePopup(false);
    setButtonDisabled(false); // Enable buttons when popup is closed
  };

  const handleViewLabs = () => {
    if (!showAddPopup && !showDeletePopup && !showUpdatePopup) { // Check if no popup is opened
      navigate("/hall-management/viewLabs");
    }
  };

  const handleLabAssignment = () => {
    if (!showAddPopup && !showDeletePopup && !showUpdatePopup) { // Check if no popup is opened
      navigate("/hall-management/assignLab");
    }
  };

  return (
    <>
      <div className="ButtonContainer">
        <button
          className="ActionButton"
          onClick={handleAddLab}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          Add
        </button>
        <button
          className="ActionButton"
          onClick={handleUpdateLab}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          Update
        </button>
        <button
          className="ActionButton"
          onClick={handleDeleteLab}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          Delete
        </button>
        <button
          className="ActionButton"
          onClick={handleViewLabs}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          View Labs
        </button>
        <button
          className="ActionButton"
          onClick={handleAssignLabs}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          Assign Labs
        </button>
      </div>
      {showAddPopup && <AddPopupL onClose={handleClosePopup} />}
      {showDeletePopup && <DeletePopupL onClose={handleCloseDeletePopup} />}
      {showUpdatePopup && <UpdatePopupL onClose={handleCloseUpdatePopup} />}
      {showLogPopup && <LogPopupL messages={logMessages} onClose={closeLogPopup} />}
    </>
  );
}

export default LabManagement;
