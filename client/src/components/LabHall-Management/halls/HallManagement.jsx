import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";
import DeletePopup from "./DeletePopup";
import UpdatePopup from "./UpdatePopup";
import LogPopup from "./LogPopup";
import assignHall from "./AssignHall"; // Import the assignHall function

function HallManagement() {
  const [showPopup, setShowPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false); // State to disable buttons
  const navigate = useNavigate();
  const [initialFilteredTimetables, setInitialFilteredTimetables] = useState([]);
  const [showLogPopup, setShowLogPopup] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const [filteredTimetables, setFilteredTimetables] = useState([]); // Define filteredTimetables state

  useEffect(() => {
    Axios.get("http://localhost:3001/api/timetables").then((response) => {
      const initialFiltered = response.data.filter(timetable => !timetable.lectureHall.assigned && timetable.subject.sessionType !== "Lab");
      setInitialFilteredTimetables(initialFiltered);
      setFilteredTimetables(initialFiltered);
    });
  }, []);

  const handleAssignHalls = async () => {
    const response = await Axios.get("http://localhost:3001/api/timetables");
    const allTimetables = response.data;
  
    const initialFiltered = allTimetables.filter(timetable => !timetable.lectureHall.assigned && timetable.subject.sessionType !== "Lab");
    setInitialFilteredTimetables(initialFiltered);
  
    const messages = [];
    for (const timetable of initialFiltered) {
      try {
        const message = await assignHall(timetable);
        messages.push(message);
      } catch (error) {
        console.error('Error assigning hall:', error);
        messages.push('Error assigning hall for timetable ID ' + timetable._id);
      }
    }
    const allAssigned = initialFiltered.every(timetable => timetable.lectureHall.assigned);
    if (allAssigned) {
      messages.push('All subjects have a hall assigned');
    }
    setLogMessages(messages);
    setShowLogPopup(true);
  };

 

  const closeLogPopup = () => {
    setShowLogPopup(false);
  };

  const handleAddHall = () => {
    setShowPopup(true);
    setButtonDisabled(true); // Disable buttons when popup is opened
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setButtonDisabled(false); // Enable buttons when popup is closed
  };

  const handleDeleteHall = () => {
    setShowDeletePopup(true);
    setButtonDisabled(true); // Disable buttons when popup is opened
  };

  const handleCloseDeletePopup = () => {
    setShowDeletePopup(false);
    setButtonDisabled(false); // Enable buttons when popup is closed
  };

  const handleUpdateHall = () => {
    setShowUpdatePopup(true);
    setButtonDisabled(true); // Disable buttons when popup is opened
  };

  const handleCloseUpdatePopup = () => {
    setShowUpdatePopup(false);
    setButtonDisabled(false); // Enable buttons when popup is closed
  };

  const handleViewHalls = () => {
    if (!showPopup && !showDeletePopup && !showUpdatePopup) { // Check if no popup is opened
      navigate("/hall-management/viewHalls");
    }
  };

  const handleHallAssignment = () => {
    if (!showPopup && !showDeletePopup && !showUpdatePopup) { // Check if no popup is opened
      navigate("/hall-management/assignHall");
    }
  };

  return (
    <>
      <div className="ButtonContainer">
        <button
          className="ActionButton"
          onClick={handleAddHall}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          Add
        </button>
        <button
          className="ActionButton"
          onClick={handleUpdateHall}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          Update
        </button>
        <button
          className="ActionButton"
          onClick={handleDeleteHall}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          Delete
        </button>
        <button
          className="ActionButton"
          onClick={handleViewHalls}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          View Halls
        </button>
        <button
          className="ActionButton"
          onClick={handleAssignHalls}
          disabled={buttonDisabled} // Disable button if a popup is opened
        >
          Assign Halls
        </button>
      </div>
      {showPopup && <Popup onClose={handleClosePopup} />}
      {showDeletePopup && <DeletePopup onClose={handleCloseDeletePopup} />}
      {showUpdatePopup && <UpdatePopup onClose={handleCloseUpdatePopup} />}
      {showLogPopup && <LogPopup messages={logMessages} onClose={closeLogPopup} />}
    </>
  );
}

export default HallManagement;
