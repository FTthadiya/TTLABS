import React, { useState } from 'react';
import Axios from 'axios';
import '../common/Popup.css';
import Swal from 'sweetalert2';

function Popup({ onClose }) {
  const [hallId, setHallId] = useState('');
  const [hallCapacity, setHallCapacity] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [capacityError, setCapacityError] = useState('');

  const handleDone = () => {
    const isCapacityValid = Number.isInteger(Number(hallCapacity)) && Number(hallCapacity) > 0;

    if (!hallId || !hallCapacity || !isCapacityValid) {
      setSubmitted(true);
      if (!hallCapacity) {
        setCapacityError('');
      } else if (!isCapacityValid) {
        setCapacityError('Please enter a valid integer for Hall Capacity');
      } else {
        setCapacityError('');
      }
      return;
    }

    Axios.post('http://localhost:3001/api/hall/createHall', {
      hallid: hallId,
      capacity: hallCapacity,
    })
    .then(() => {
      Swal.fire({
        position: "center",
        icon: "success",
        title: `${hallId} has been added successfully`,
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
      <div className="InputLabel">Enter Hall ID : </div>
      <input
        type="text"
        value={hallId}
        onChange={(e) => setHallId(e.target.value)}
        placeholder="Hall Id"
        className="PopupInputField"
      />
      {submitted && !hallId && <div className="ErrorMessage">Please fill in the Hall ID</div>}
      
      <div className="InputLabel">Enter Hall Capacity : </div>
      <input
        type="text"
        value={hallCapacity}
        onChange={(e) => setHallCapacity(e.target.value)}
        placeholder="Hall Capacity"
        className="PopupInputField"
      />
      {submitted && !hallCapacity && <div className="ErrorMessage">Please fill in the Hall Capacity</div>}
      {submitted && hallCapacity && capacityError && <div className="ErrorMessage">{capacityError}</div>}
      
      <button onClick={handleDone} className="DoneButton">Add</button>
      <button onClick={handleCancel} className="CancelButtonAdd">Cancel</button>
    </div>
  );
}

export default Popup;
