import React, { useState, useEffect } from "react";
import TimetableGrid from "../Common/TimetableGrid";
import { getLecturerTTData } from "../Services/TimetableService";
import TTLoading from "../../../assets/timetableManagement/TimetableLoading.png";

function LecturerTimetables({ user }) {
  const [timetableData, setTimetableData] = useState([]);

  useEffect(() => {
    try {
      async function fetchData() {
        const reqBody = {
          functionName: "getCurrSemester",
        };
        const { data } = await getLecturerTTData(user, reqBody);
        setTimetableData(data);
      }
      fetchData();
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <div className="container-fluid">
      <h3 className="text-center text-dark">Original Timetable</h3>
      <br />
      <div className="col d-flex flex-column" data-intro="To view default timetable generated in begining of the semester"> 
        <div>
          {timetableData.length === 0 ? (
            <div className="col d-flex flex-column justify-content-center align-items-center">
              <img src={TTLoading} alt="Loading" />
            </div>
          ) : (
            <TimetableGrid timetableData={timetableData}/>
          )}
        </div>
      </div>
    </div>
  );
}

export default LecturerTimetables;
