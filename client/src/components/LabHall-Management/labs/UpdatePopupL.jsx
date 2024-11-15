import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import '../common/Popup.css';
import Swal from 'sweetalert2';

function UpdatePopupL({ onClose }) {
  const [selectedLabId, setSelectedLabId] = useState('');
  const [newLabId, setNewLabId] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [labIds, setLabIds] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [capacityError, setCapacityError] = useState('');

  useEffect(() => {
    Axios.get("http://localhost:3001/api/lab/getLabs")
      .then((response) => {
        setLabIds(response.data.map(lab => lab.labid));
      })
      .catch((error) => {
        console.error('Error fetching lab IDs:', error);
      });
  }, []);

  const handleUpdate = async () => {
    const isCapacityValid = Number.isInteger(Number(newCapacity)) && Number(newCapacity) > 0;

    if (!selectedLabId || !newLabId || !newCapacity || !isCapacityValid) {
      setSubmitted(true);
      if (!newCapacity) {
        setCapacityError('');
      } else if (!isCapacityValid) {
        setCapacityError('Please enter a valid integer for Lab Capacity');
      } else {
        setCapacityError('');
      }
      return;
    }

    try {
      await Axios.put(`http://localhost:3001/api/lab/updateLab/${selectedLabId}`, {
        labid: newLabId,
        capacity: newCapacity,
      });
      Swal.fire({
        position: "center",
        icon: "success",
        title: `${selectedLabId} has been updated successfully`,
        showConfirmButton: false,
        timer: 1500,
        background: "#f0edd4",
        color: "#000",
      });
      onClose();
    } catch (error) {
      console.error('Error updating lab:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="PopupUpdate">
      <div className="InputLabel">Select Lab ID to Update : </div>
      <select
        value={selectedLabId}
        onChange={(e) => setSelectedLabId(e.target.value)}
        className="PopupInputField"
      >
        <option value="">Select Lab Id</option>
        {labIds.map((labId) => (
          <option key={labId} value={labId}>
            {labId}
          </option>
        ))}
      </select>
      {submitted && !selectedLabId && <div className="ErrorMessage">Please Select a Lab Id</div>}
      <div className="InputLabel">Enter New Lab ID : </div>
      <input
        type="text"
        value={newLabId}
        onChange={(e) => setNewLabId(e.target.value)}
        placeholder="Enter New Lab Id"
        className="PopupInputField"
      />
      {submitted && !newLabId && <div className="ErrorMessage">Please Fill in the New Lab Id</div>}
      <div className="InputLabel">Enter New Lab Capacity : </div>
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

export default UpdatePopupL;
