import React, { useEffect, useState } from "react";
import _ from "lodash";
import ResolverTable from "./ResolverTable";
import {
  getSpecBatchTTData,
  getTimetableData,
  regenerateTimetables,
  saveTimetableData,
  deleteTimetableObj,
} from "../../Services/TimetableService";
import UnassignedSelector from "./UnassignedSelector";
import { getSpecBatchId } from "../../Services/SpecBatchService";
import { getSubjects } from "../../Services/SubjectService";
import { useNavigate, useLocation } from "react-router-dom";
import { getDays, getAllTimes } from "../../Services/DaysAndTimeService";
import { toast } from "react-toastify";
import SearchBox from "../../Common/SearchBox";
import axios from "axios";
import "../../Css/button.css";

function UnassignedResolver(props) {
  const location = useLocation();

  const [specBatchesIds, setspecBatchesIds] = useState([]);
  const [timetableData, setTimetableData] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allTimetables, setAllTimetables] = useState([]);
  const [notAssignedSubjects, setNotAssignedSubjects] = useState([]);
  const [allDays, setAllDays] = useState([]);
  const [allTimes, setAllTimes] = useState([]);
  const [timesForCards, setTimesForCards] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lecturersOtherSub, setLecturersOtherSub] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const { specBatchesIds } = location.state;
    setspecBatchesIds(specBatchesIds);
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: allSubjects } = await getSubjects();
      const validSubjects = allSubjects.filter((s) => {
        return s.specBatches.some((batch) =>
          specBatchesIds.includes(batch._id)
        );
      });
      setAllSubjects(validSubjects);

      const reqBody = {
        functionName: "getCurrSemester",
      };

      const { data: allTimetables } = await getTimetableData(reqBody);
      setAllTimetables(allTimetables);
      const unassignedSubjects = filterNotAssigned(
        validSubjects,
        allTimetables
      );

      setNotAssignedSubjects(unassignedSubjects);

      const allDays = await getDays();
      const allTimes = await getAllTimes();

      setAllDays(allDays.data);
      setAllTimes(allTimes.data);

      const timesForCards = allTimes.data.filter((item, index) => index !== 4);
      setTimesForCards(timesForCards);
    };
    fetchData();
  }, [specBatchesIds]);

  const filterNotAssigned = (subjects, timetables) => {
    let unassignedSubjects = subjects.filter((subject) => {
      return !timetables.some((timetable) => {
        return timetable.subject._id.toString() === subject._id.toString();
      });
    });
    return unassignedSubjects;
  };

  const handleRegenerate = async () => {
    try {
      const { data } = await regenerateTimetables();
      if (data) {
        navigate("/generate-specbatch-selector");
      }
    } catch (error) {
      console.log("Error", error.message);
    }
  };

  const handleSubmit = async () => {
    await axios.get("http://localhost:3001/api/restimetable/reset");
    navigate("/hall-management");
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  const handleSave = async (subject, selectedDayId, selectedTimeId) => {
    const selectedDay = allDays.find((d) => {
      return d._id === selectedDayId;
    });
    const selectedtTime = allTimes.find((t) => {
      return t._id === selectedTimeId;
    });

    const combinedTimetables = getCommonTimetable(subject);

    if (
      isSlotAvailable(subject, selectedDay, selectedtTime, combinedTimetables)
    ) {
      const newNotAssignedSubjects = notAssignedSubjects.filter((s) => {
        return s._id !== subject._id;
      });

      const saveObj = {
        functionName: "getCurrSemester",
        subjectId: subject._id,
        lectureHallId: "null",
        dayId: selectedDayId,
        startTimeId: selectedTimeId,
      };
      const { data } = await saveTimetableData(saveObj);

      let newTimetableData = timetableData;
      newTimetableData.push(data);

      let newTimetables = allTimetables;
      newTimetables.push(data);

      setNotAssignedSubjects(newNotAssignedSubjects);
      setTimetableData(newTimetableData);
      setAllTimetables(newTimetables);
    } else {
      toast.error("Slot is not available. Please select another slot.");
    }
  };

  const isSlotAvailable = (session, day, time, combinedTimetables) => {
    let notAvailable = [];

    if (
      (time.index <= 5 && time.index + session.duration > 5) ||
      (time.index <= 9 && time.index + session.duration > 10)
    ) {
      notAvailable.push(session);
    }

    combinedTimetables.forEach((s, index2) => {
      if (
        !(session._id.toString() === s.subject._id.toString()) &&
        day.index === s.day.index &&
        ((time.index <= s.startTime.index &&
          time.index + session.duration > s.startTime.index) ||
          (s.startTime.index <= time.index &&
            s.startTime.index + s.subject.duration > time.index))
      ) {
        notAvailable.push(session);
      }
    });

    for (const s of allTimetables) {
      const isDoubleBooked =
        !(session._id.toString() === s.subject._id.toString()) &&
        session.lecturer._id.toString() === s.subject.lecturer._id.toString() &&
        day.index === s.day.index &&
        ((time.index <= s.startTime.index &&
          time.index + session.duration > s.startTime.index) ||
          (s.startTime.index <= time.index &&
            s.startTime.index + s.subject.duration > time.index));

      if (isDoubleBooked) {
        notAvailable.push(session);
        break;
      }
    }

    allTimetables.forEach((s, index2) => {
      if (
        !(session._id.toString() === s.subject._id.toString()) &&
        session.lecturer._id.toString() === s.subject.lecturer._id.toString() &&
        day.index === s.day.index &&
        ((time.index <= s.startTime.index &&
          time.index + s.subject.duration > s.startTime.index) ||
          (s.startTime.index <= time.index &&
            s.startTime.index + s.subject.duration > time.index))
      ) {
        notAvailable.push(session);
      }
    });

    if (notAvailable.length > 0) {
      return false;
    } else {
      return true;
    }
  };

  const handleLoad = (subject) => {
    setSelectedSubjectId(subject._id);
    const commonTimetable = getCommonTimetable(subject);

    const lecturer = subject.lecturer._id;
    const otherSubjects = allTimetables.filter((timetable) => {
      return timetable.subject.lecturer._id.toString() === lecturer.toString();
    });
    setLecturersOtherSub(otherSubjects);

    if (commonTimetable) {
      setTimetableData(commonTimetable);
    }
  };

  const getCommonTimetable = (session) => {
    const batchesForSession = session.specBatches;
    if (batchesForSession === undefined) {
      return false;
    }
    const otherSubjects = allTimetables.filter((timetable) =>
      timetable.subject.specBatches.some((subjectBatch) =>
        batchesForSession.some(
          (batch) => batch._id.toString() === subjectBatch._id.toString()
        )
      )
    );
    const uniqueSubject = _.uniqBy(otherSubjects, (timetable) =>
      timetable._id.toString()
    );
    return uniqueSubject;
  };

  const handleRemoveFromTable = async (timetableId) => {
    console.log(timetableId);
    const initTimetableData = timetableData;
    const initTimetables = allTimetables;
    const initNotAssigned = notAssignedSubjects;
    try {
      const deletingObj = timetableData.filter((t) => {
        return t._id === timetableId;
      });
      const { data } = await deleteTimetableObj(timetableId);

      const newTimetableData = timetableData.filter((t) => {
        return t._id !== timetableId;
      });

      const newTimetables = allTimetables.filter((t) => {
        return t._id !== timetableId;
      });

      let newNotAssignedSubjects = notAssignedSubjects;
      newNotAssignedSubjects.push(deletingObj[0].subject);

      setTimetableData(newTimetableData);
      setAllTimetables(newTimetables);
      setNotAssignedSubjects(newNotAssignedSubjects);
    } catch (error) {
      console.log(error.message);
      if (error.response && error.response.status === 404)
        toast.error("Subject is already removed.");
      setTimetableData(initTimetableData);
      setAllTimetables(initTimetables);
      setNotAssignedSubjects(initNotAssigned);
    }
  };

  const getSearched = () => {
    let filtered;
    if (searchQuery) {
      filtered = notAssignedSubjects.filter((s) =>
        s.subjectName.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    } else {
      filtered = notAssignedSubjects;
    }
    return filtered;
  };

  const newNotAssignedSubjects = getSearched();

  return (
    <div className="container-fluid mt-3">
      {notAssignedSubjects.length > 0 ? (
        <div className="row">
          <div className="col-3">
            <div className="form-container ms-3 mt-3" style={{ width: "96%" }}>
              <h5 className="text-dark text-center">{`Unassigned Subjects : ${notAssignedSubjects.length}`}</h5>
            </div>
            <br />
            <div className="justify-content-center ms-3">
              <SearchBox value={searchQuery} onChange={handleSearch} />
            </div>
            <div
              style={{
                height: "calc(100vh - 120px)",
                overflowY: "auto",
                marginTop: "20px",
              }}
            >
              <div className="me-3">
                {newNotAssignedSubjects.map((na) => (
                  <UnassignedSelector
                    key={na._id}
                    data={na}
                    days={allDays}
                    times={timesForCards}
                    isSelected={na._id === selectedSubjectId}
                    onLoad={() => handleLoad(na)}
                    onSave={handleSave}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="d-flex justify-content-between mb-3">
              <div className="align-self-start text-dark pt-3 ms-4">
                <div className="row d-flex justify-content-between">
                  Lecturer Booked:{" "}
                  {
                    <div
                      className="ms-2 bg-danger p-0"
                      style={{ width: "20px", height: "20px" }}
                    ></div>
                  }
                </div>
              </div>
              <div className="align-self-end">
                <button
                  className="btn btn-primary me-3 custom-button"
                  onClick={handleRegenerate}
                >
                  Regenerate
                </button>
              </div>
            </div>
            <ResolverTable
              timetableData={timetableData}
              lecturersOtherSub={lecturersOtherSub}
              onRemove={handleRemoveFromTable}
            />
          </div>
        </div>
      ) : (
        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <h5 className="text-dark">Timetable Generation Successful!</h5>
          <p className="text-dark">
            Press The Submit Button to proceed with Hall allocation
          </p>
          <button
            className="btn btn-primary custom-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default UnassignedResolver;
