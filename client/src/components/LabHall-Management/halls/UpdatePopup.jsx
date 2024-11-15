import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import '../common/Popup.css';
import Swal from 'sweetalert2';

function UpdatePopup({ onClose }) {
  const [selectedHallId, setSelectedHallId] = useState('');
  const [newHallId, setNewHallId] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [hallIds, setHallIds] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [capacityError, setCapacityError] = useState('');

  useEffect(() => {
    Axios.get("http://localhost:3001/api/hall/getHalls")
      .then((response) => {
        setHallIds(response.data.map(hall => hall.hallid));
      })
      .catch((error) => {
        console.error('Error fetching hall IDs:', error);
      });
  }, []);

  const handleUpdate = async () => {
    const isCapacityValid = Number.isInteger(Number(newCapacity)) && Number(newCapacity) > 0;

    if (!selectedHallId || !newHallId || !newCapacity || !isCapacityValid) {
      setSubmitted(true);
      if (!newCapacity) {
        setCapacityError('');
      } else if (!isCapacityValid) {
        setCapacityError('Please enter a valid integer for Hall Capacity');
      } else {
        setCapacityError('');
      }
      return;
    }

    try {
      await Axios.put(`http://localhost:3001/api/hall/updateHall/${selectedHallId}`, {
        hallid: newHallId,
        capacity: newCapacity,
      });
      Swal.fire({
        position: "center",
        icon: "success",
        title: `${selectedHallId} has been successfully updated `,
        showConfirmButton: false,
        timer: 1500,
        background: "#f0edd4",
        color: "#000",
      });
      onClose();
    } catch (error) {
      console.error('Error updating hall:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="PopupUpdate">
      <div className="InputLabel">Select Hall ID to Update : </div>
      <select
        value={selectedHallId}
        onChange={(e) => setSelectedHallId(e.target.value)}
        className="PopupInputField"
      >
        <option value="">Select Hall Id</option>
        {hallIds.map((hallId) => (
          <option key={hallId} value={hallId}>
            {hallId}
          </option>
        ))}
      </select>
      {submitted && !selectedHallId && <div className="ErrorMessage">Please Select a Hall Id</div>}
      <div className="InputLabel">Enter New Hall ID : </div>
      <input
        type="text"
        value={newHallId}
        onChange={(e) => setNewHallId(e.target.value)}
        placeholder="Enter New Hall Id"
        className="PopupInputField"
      />
      {submitted && !newHallId && <div className="ErrorMessage">Please Fill in the New Hall Id</div>}
      <div className="InputLabel">Enter New Hall Capacity : </div>
      <input
        type="text"
        value={newCapacity}
        onChange={(e) => setNewCapacity(e.target.value)}
        placeholder="Enter New Capacity"
        className="PopupInputField"
      />
      {submitted && !newCapacity && <div className="ErrorMessage">Please Fill in the New Capacity</div>}
      {submitted && newCapacity && capacityError && <div className="ErrorMessage">{capacityError}</div>}
      <button onClick={handleUpdate} className="DoneButton">Update</button>
      <button onClick={handleCancel} className="CancelButtonUpdate">Cancel</button>
    </div>
  );
}

export default UpdatePopup;
