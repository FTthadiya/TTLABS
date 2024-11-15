import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrefCard from "./PrefCard";
import TimetableGrid from "../Common/TimetableGrid";
import { getLecturerTTData } from "../Services/TimetableService";
import { getFunctionalities } from "../Services/FunctionalitiesService";
import TTLoading from "../../../assets/timetableManagement/TimetableLoading.png";
import NotificationBar from "../../NotificationManagement/NotificationBar";
import axios from "axios";

function LecturerHome({ user }) {
  const [isLectPrefVisible, setIsLectPrefVisible] = useState(false);
  const [timetableData, setTimetableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      setInitVisibilityState();
      async function fetchData() {
        const reqBody = {
          functionName: "getCurrSemester",
        };

        const { data } = await axios.post(
          "http://localhost:3001/api/resTimetable/lecturer/" + user.userId,
          reqBody
        );
        setTimetableData(data);
      }
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const setInitVisibilityState = async () => {
    const { data } = await getFunctionalities("getLectPrefVisibility");
    setIsLectPrefVisible(data.isToggled);
  };

  return (
    <div className="container-fluid">
      <div
        className="container-fluid d-flex justify-content-end"
        style={{ paddingBottom: 10, paddingTop: 20 }}
      ></div>

      {user && <NotificationBar user={user} />}
      <div className="row">
        <div className="col-2 m-3 d-flex flex-column">
          <button
            className="btn"
            style={{ borderWidth: 0, cursor: "pointer" }}
            onClick={() => {
              console.log("User Profile Icon pressed");
            }}
            data-intro="Navigate to user profile"
          >
            <i
              className="fa fa-user-circle fa-4x mx-2"
              style={{ transition: "color 0.5s" }}
              onMouseOver={(e) => (e.target.style.color = "#212529")}
              aria-hidden="true"
              onClick={() => {
                navigate("/userprofile");
              }}
            ></i>
          </button>
          {isLectPrefVisible ? <PrefCard /> : null}
        </div>
        <div className="col mt-5 d-flex flex-column">
          <div
            className={timetableData.length > 0 ? "mt-5" : ""}
            data-intro="To view specific timetables based on the user"
          >
            {timetableData.length === 0 ? (
              <div className="col d-flex flex-column justify-content-center align-items-center">
                <img src={TTLoading} alt="Loading" />
              </div>
            ) : (
              <TimetableGrid timetableData={timetableData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerHome;
