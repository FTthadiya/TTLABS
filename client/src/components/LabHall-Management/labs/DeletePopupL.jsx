import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import '../common/Popup.css';
import Swal from 'sweetalert2';

function DeletePopupL({ onClose }) {
  const [selectedLabId, setSelectedLabId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [labIds, setLabIds] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/api/lab/getLabs").then((response) => {
      setLabIds(response.data.map(lab => lab.labid));
    });
  }, []);

  const handleDelete = () => {
    if (!selectedLabId) {
      setSubmitted(true);
      return;
    }

    Swal.fire({
      title: `Are you sure you want to delete ${selectedLabId}?`,
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
        Axios.delete(`http://localhost:3001/api/lab/deleteLab/${selectedLabId}`)
        .then(() => {
          Swal.fire({
            position: "center",
            icon: "success",
            title: `${selectedLabId} has been deleted successfully`,
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
      <div className="InputLabel">Select Lab to Delete : </div>
      <select
        value={selectedLabId}
        onChange={(e) => setSelectedLabId(e.target.value)}
        className="PopupInputField"
      >
        <option value="">Select Lab ID</option>
        {labIds.map((labId) => (
          <option key={labId} value={labId}>{labId}</option>
        ))}
      </select>
      {submitted && !selectedLabId && <div className="ErrorMessage">Please Select a Lab ID</div>}
      <button onClick={handleDelete} className="DoneButton">Delete</button>
      <button onClick={handleCancel} className="CancelButton">Cancel</button>
    </div>
  );
}

export default DeletePopupL;
