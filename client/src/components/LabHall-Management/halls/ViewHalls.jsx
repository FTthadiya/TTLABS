import React, { useState, useEffect } from 'react';
import CustomTable from '../common/CustomTable';
import SearchBox from '../../TimeTableManagement/Common/SearchBox';
import Axios from 'axios';
import Swal from 'sweetalert2';

function ViewHalls() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [listOfHalls, setListOfHalls] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/api/hall/getHalls").then((response) => {
      setListOfHalls(response.data);
    });
  }, []);

  const handleDelete = (hallId) => {
    Swal.fire({
      title: `Are you sure you want to delete ${hallId}?`,
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
        Axios.delete(`http://localhost:3001/api/hall/deleteHall/${hallId}`)
        .then(() => {
          setListOfHalls(listOfHalls.filter(hall => hall.hallid !== hallId));
          Swal.fire({
            position: "center",
            icon: "success",
            title: `${hallId} has been successfully deleted`,
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

  const columns = [
    { path: 'hallid', label: 'Hall ID' },
    { path: 'capacity', label: 'Hall Capacity' },
    {
      key: "delete",
      content: (hall) => (
        <button
          onClick={() => handleDelete(hall.hallid)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      ),
    },
  ];

  const filteredHalls = listOfHalls.filter((hall) =>
    hall.hallid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHalls.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <h2 className='view-header' style={{ marginTop: '-45px', marginBottom: '25px', marginLeft: '15%', alignSelf: 'center', color: '#000000' }}>Lecture Halls</h2>
      <div className='wrapper' style={{position: "relative"}}>
      <input
        type="text"
        placeholder="Search by Hall ID"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='search-bar'
      />
      <i className="fa fa-search search-icon" aria-hidden="true"></i>         
      </div>
      
   
      
      

      <CustomTable columns={columns} data={currentItems} />
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredHalls.length}
        paginate={paginate}
      />
    </div>
  );
}

const Pagination = ({ itemsPerPage, totalItems, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
  <ul className="pagination pagination-dark">
    {pageNumbers.map((number) => (
      <li key={number} className="page-item">
        <a
          onClick={() => paginate(number)}
          href="#"
          className="page-link custom-style"
        >
          {number}
        </a>
      </li>
    ))}
  </ul>
</nav>

  );
};

export default ViewHalls;