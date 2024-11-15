import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import '../common/Popup.css';
import Swal from 'sweetalert2';

function DeletePopup({ onClose }) {
  const [selectedHallId, setSelectedHallId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hallIds, setHallIds] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/api/hall/getHalls").then((response) => {
      setHallIds(response.data.map(hall => hall.hallid));
    });
  }, []);

  const handleDelete = () => {
    if (!selectedHallId) {
      setSubmitted(true);
      return;
    }

    Swal.fire({
      title: `Are you sure you want to delete ${selectedHallId}?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#dc3545",
      background: "#f0edd4",
      color: "#000",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`http://localhost:3001/api/hall/deleteHall/${selectedHallId}`)
        .then(() => {
          Swal.fire({
            position: "center",
            icon: "success",
            title: `${selectedHallId} has been successfully deleted`,
            showConfirmButton: false,
            timer: 1500,
            background: "#f0edd4",
            color: "#000"
          });
          onClose();
        })
        .catch((error) => {
          console.error('There was an error!', error);
        });
      }
    }); 
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="Popup">
      <div className="InputLabel">Select Hall to Delete : </div>
      <select
        value={selectedHallId}
        onChange={(e) => setSelectedHallId(e.target.value)}
        className="PopupInputField"
      >
        <option value="">Select Hall ID</option>
        {hallIds.map((hallId) => (
          <option key={hallId} value={hallId}>{hallId}</option>
        ))}
      </select>
      {submitted && !selectedHallId && <div className="ErrorMessage">Please Select a Hall ID</div>}
      <button onClick={handleDelete} className="DoneButton">Delete</button>
      <button onClick={handleCancel} className="CancelButton">Cancel</button>
    </div>
  );
}

export default DeletePopup;
