import React, { useState } from 'react';
import Axios from 'axios';
import '../common/Popup.css';
import Swal from 'sweetalert2';

function AddPopupL({ onClose }) {
  const [labId, setLabId] = useState('');
  const [labCapacity, setLabCapacity] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [capacityError, setCapacityError] = useState('');

  const handleDone = () => {
    const isCapacityValid = Number.isInteger(Number(labCapacity)) && Number(labCapacity) > 0;

    if (!labId || !labCapacity || !isCapacityValid) {
      setSubmitted(true);
      if (!labCapacity) {
        setCapacityError('');
      } else if (!isCapacityValid) {
        setCapacityError('Please enter a valid integer for Lab Capacity');
      } else {
        setCapacityError('');
      }
      return;
    }

    Axios.post('http://localhost:3001/api/lab/createLab', {
      labid: labId,
      capacity: labCapacity,
    })
    .then(() => {
      Swal.fire({
        position: "center",
        icon: "success",
        title: `${labId} has been added successfully`,
        showConfirmButton: false,
        timer: 1500,
        background: "#f0edd4",
        color: "#000",
      });
      onClose();
    })
    .catch((error) => {
      console.error('There was an error!', error);
      // Optionally, you can also show an error alert here
    });
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="Popup">
      <div className="InputLabel">Enter Lab ID : </div>
      <input
        type="text"
        value={labId}
        onChange={(e) => setLabId(e.target.value)}
        placeholder="Lab Id"
        className="PopupInputField"
      />
      {submitted && !labId && <div className="ErrorMessage">Please fill in the Lab ID</div>}
      
      <div className="InputLabel">Enter Lab Capacity : </div>
      <input
        type="text"
        value={labCapacity}
        onChange={(e) => setLabCapacity(e.target.value)}
        placeholder="Lab Capacity"
        className="PopupInputField"
      />
      {submitted && !labCapacity && <div className="ErrorMessage">Please fill in the Lab Capacity</div>}
      {submitted && labCapacity && capacityError && <div className="ErrorMessage">{capacityError}</div>}
      
      <button onClick={handleDone} className="DoneButton">Add</button>
      <button onClick={handleCancel} className="CancelButtonAdd">Cancel</button>
    </div>
  );
}

export default AddPopupL;
