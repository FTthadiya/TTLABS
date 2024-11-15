import React, { useState, useEffect } from "react";
import _, { forEach } from "lodash";
import { parse, addHours, format } from "date-fns";

import { getDays, getAllTimes } from "../../TimeTableManagement/Services/DaysAndTimeService";
import { AdminResEdit } from "./AdminResEdit";
import axios from "axios";
import "../css/theme.css"

function AdminResTimetable({previewId, selectedModule}) {
  const [gridData, setGridData] = useState([]);
  const [originalData, setOriginalData] = useState([])
  const [previewData, setPreviewData] = useState([]);
  const [days, setDays] = useState([]);
  const [times, setTimes] = useState([]);
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState([]);

  var tempData = [];


  let emptyCells = [];

  useEffect(() => {
    setGridData(originalData);
}, [originalData]);


  useEffect(() => {
    if(selectedModule !== null){
      fetchData();
    }
    
  }, [selectedModule]);

  useEffect(() => {
    if (previewId !== null) {
      fetchPreviewData();
    }
    console.log(previewId);
  }, [previewId])

  useEffect(() => {
      checkClashesForAll();
  }, [gridData])

  useEffect(() => {
    const fetchDaysTimes = async () => {
      await handleRenderDaysAndTimes();
    };
    fetchDaysTimes();

  }, [])


  const handleRenderDaysAndTimes = async () => {
    try {
      const { data: days } = await getDays();
      setDays(days);

      const { data: times } = await getAllTimes();
      setTimes(times);
    } catch (error) {
      console.log(error);
    }
  };

  
  const fetchData = async () => {
    await handleRenderDaysAndTimes();

    if(selectedModule === "all"){
      axios.get("http://localhost:3001/api/resTimetable/data/")
      .then(response => {
        console.log(response.data);
        setOriginalData(response.data);
        console.log("response", response.data);
      })
      .catch(error => {
        console.error("Error fetching timetable data:", error);
      });

    }
    else{
      axios.get("http://localhost:3001/api/resTimetable/data/"+selectedModule)
      .then(response => {
        console.log(response.data);
        setOriginalData(response.data);
        console.log("response", response.data);
      })
      .catch((error) => {
        console.error("Error fetching timetable data:", error);
      });
    }
  }

  const fetchPreviewData = () => {

    axios.get("http://localhost:3001/api/saveRequest/preview/"+previewId)
    .then(response => {
      console.log(response.data);
      setPreviewData(response.data);
      console.log("response", response.data);
    })
    .catch((error) => {
      console.error("Error fetching timetable data:", error);
      if (error.response.data.error) {
        alert(error.response.data.error);
      }
    });


  }
  

  const getEndTime = (time) => {
    const parsedTime = parse(time.name, "HH:mm", new Date());
    const endTime = addHours(parsedTime, 1);
    return format(endTime, "HH:mm");
  };

  const getEndTimeByDuration = (startTime, durationHours) => {
    var [startHours, startMinutes] = startTime.split(":").map(Number);
    var endHours = (startHours + durationHours) % 24;
    return `${String(endHours).padStart(2, "0")}:${String(startMinutes).padStart(2, "0")}`;
  }


  const blockEmptyCell = (subject, day, time) => {
    const duration = subject.subject.duration;
    let timeIndex = time.index;
    for (let i = 1; i < duration; i++) {
      const blockedCell = {
        dayId: day._id,
        timeId: _.get(_.find(times, { index: timeIndex + i }), "_id", null),
      };
      emptyCells.push(blockedCell);
    }
  };

  const handleCellClick = (subject, day, time) => {
    if (!subject) {
      // Open admin reschedule form for empty cell
      setSelectedCellData({ updatedId: null, day, time });
    } else {
        setSelectedCellData({updateId:subject._id,day,time,
          currSemester: subject.currSemester,
          specBatches: subject.subject.specBatches,
          studentCount: subject.subject.studentCount,
          moduleCode: subject.subject.subjectCode,
          module: subject.subject.subjectName,
          lecturerName: subject.subject.lecturer.lecturerName,
          sessionType: subject.subject.sessionType,
          duration: subject.subject.duration,
          hall: subject.lectureHall.hallid,
        });
    }
  };

  const handleClose = () => {
    setSelectedCellData(null);
  };

  const renderCell = (day, time) => {

    const data = previewId ? previewData : gridData;
    
    const subject = data.find(
      (subject) =>
        subject.day._id === day._id && subject.startTime._id === time._id
    );
    if (subject) {
      
      return subject;
    }
    return null;
  };


  const checkClashesForAll = () => {

    tempData = gridData;

    tempData.some(lecture => {
      const clashResult = checkClashesAndProcess(lecture);
        if (clashResult) {
          const {data, sessionList} = clashResult;
          const subject = JSON.parse(JSON.stringify(sessionList[0]));
          const sessions = JSON.parse(JSON.stringify(sessionList));
          const {startTime, duration} = combineTimeSlots(sessionList);
          if(startTime)
            {
              subject.sessionList = sessions;
              subject.subject.duration = duration;
              subject.startTime = startTime;
              setGridData([subject,...data])
              console.log("session group", sessionList);
              return true;

            }
            else{
              console.log("Timeslot not found")
            }
        }
    });


    console.log("TempData", tempData);

  }

  const checkClashesAndProcess = (lecture) => {
    const { day, startTime, subject} = lecture;
    const startTimeName = startTime.name;
    const dayIndex = day._id;
    const duration = subject.duration;
    
    const groupedLectures = [];
    const lectures = gridData.filter(lec => lec.day._id === dayIndex);
    
    const startHour = parseInt(startTimeName.split(':')[0]);
    const startMinute = parseInt(startTimeName.split(':')[1]);
    const startTimeInMinutes = startHour * 60 + startMinute;

    const durationInMinutes = duration * 60;
    const endTimeInMinutes = startTimeInMinutes + durationInMinutes;

    for (const lecture of lectures) {
        const lectureStartHour = parseInt(lecture.startTime.name.split(':')[0]);
        const lectureStartMinute = parseInt(lecture.startTime.name.split(':')[1]);
        const lectureStartTimeInMinutes = lectureStartHour * 60 + lectureStartMinute;
        const lectureEndTimeInMinutes = lectureStartTimeInMinutes + lecture.subject.duration * 60;

        if (
            (lectureStartTimeInMinutes < endTimeInMinutes && lectureEndTimeInMinutes > startTimeInMinutes)
        ) {
            const lec = originalData.find(data => data._id === lecture._id)
                groupedLectures.push(lec);
              
        }
    }

    if (groupedLectures.length <= 1) {
      return null;
    }
    else if (groupedLectures.length > 1){

      var data = gridData;

      data = deleteItemById(data, lecture._id);
      
     groupedLectures.forEach(item => {
      data = deleteItemById(data ,item._id);
     })

      return {data: data, sessionList: groupedLectures};
    }
}

const deleteItemById = (data , idToDelete) => {
   return data.filter(item => item._id !== idToDelete);
};

const combineTimeSlots = (slots) => {

  const startTimesInMinutes = slots.map(slot => {
      const [hours, minutes] = slot.startTime.name.split(':').map(Number);
      return hours * 60 + minutes;
  });

  const latestEndTime = Math.max(...startTimesInMinutes.map((startTime, index) => startTime + slots[index].subject.duration * 60));

  const earliestStartTime = Math.min(...startTimesInMinutes);

  const combinedDuration = (latestEndTime - earliestStartTime) / 60;

  const hours = Math.floor(earliestStartTime / 60);
  const minutes = earliestStartTime % 60;
  const combinedStartTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

  const startTimeObj = times.find(item => item.name === combinedStartTime)

  return {
      startTime: startTimeObj,
      duration: combinedDuration
  };
}


  const renderCellContent = (subject, day, time) => {
    if (subject !== null) {
        return (
            <div
            className={`card card-color ${previewId ? subject.isNew ? 'card-color-new' : 'card-color-old': ''}`}
              style={{
                borderColor: "#f8f9fa",
                position: 'static',
                
              }}
            >
              {subject.sessionList ? 
              <div className="card-body">
                {
                  subject.sessionList.map((s, index) => 
                  <h5 className="card-title" key={index}>
                    {s.subject.subjectCode}
                  </h5>

                  )
                }
              
            </div>
              : <div className="card-body">
                <h5 className="card-title">
                  {subject.subject.subjectCode} - {subject.subject.subjectName} (
                  {subject.subject.sessionType})
                </h5>
                <p className="card-text">{subject.subject.lecturer.lecturerName}</p>
                {subject.lectureHall.hallid && (
                  <p className="card-text">{subject.lectureHall.hallid}</p>
                )}
              </div>}
              <div className="card-footer text-muted">
                {!subject.sessionList && !previewId && <button style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold"}}
                className="cellButton btn btn-primary btn-sm float-right"
                onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(subject,day,time);
                }}
                >
                Edit
                </button>}
                {subject.sessionList && <div>
                  <button style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold"}}
                className=" btn btn-primary btn-sm float-right"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCollection(subject.sessionList);
                }}
                >
                View All
                </button>
                </div>}
                </div>
                </div>
             );
    } else {
      return (
        <button
          className="cellButton btn btn-primary btn-sm float-right" style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold"}}
          onClick={(e) => {
            e.stopPropagation();
            handleCellClick(null, day, time);
          }}
        >
          Edit
        </button>
      );
    }
  };

  return (
    <div>
      <div className="container" style={{marginTop: '2rem'}}>
        <table className="table table-dark table-bordered text-center" data-intro="View the reschedule timetable filtered by selected module.">
          <thead>
            <tr>
              <th scope="col" style={{ background: "#F0EDD4", color: "black" }}>Time</th>
              {days.map((day) => (
                <th key={day._id} scope="col" style={{ background: "#F0EDD4", color: "black" }}>
                  {day.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <React.Fragment key={time._id}>
                {time.name === "12:30" ? (
                  <tr key={time._id}>
                    <th scope="row" className="col-1" style={{ background: "#F0EDD4", color: "black" }}>
                      {time.name}-{getEndTime(time)}
                    </th>
                    <th
                      scope="row"
                      colSpan={days.length}
                      style={{ background: "#FFAB00", color: "black" }}
                    >
                      Lunch Break
                    </th>
                  </tr>
                ) : (
                  <tr key={time._id}>
                    <th scope="row" className="col-1" style={{ background: "#F0EDD4", color: "black" }}>
                      {time.name}-{getEndTime(time)}
                    </th>
                    {days.map((day) => {
                      const subject = renderCell(day, time);
                      if (subject) {
                        blockEmptyCell(subject, day, time);
                        return (
                          <td className="tableCell" style={{ position: "relative", background: "#F9FBE7", color: "black" }}
                            key={`${day._id}-${time._id}`}
                            rowSpan={subject.subject.duration}
                        
                          >
                            {renderCellContent(subject, day, time)}
                          </td>
                        );
                      }
                      return (() => {
                        const emptyCell = _.find(emptyCells, {
                          dayId: day._id,
                          timeId: time._id,
                        });
                        if (emptyCell) {
                          return null;
                        }
                        return (
                          <td  className="tableCell" style={{ position: "relative", background: "#F9FBE7", color: "black" }} key={_.uniqueId()}>
                            {renderCellContent(subject, day, time)}
                          </td>
                        );
                      })();
                    })}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      { selectedCollection.length > 0 &&
        <div className="container">
         <div className="card shadow position-fixed top-50 start-50 translate-middle " style={{ display: 'flex', flexDirection: 'column', height:'50%', width: '60%', padding: '10px', backgroundColor: "#F0EDD4" , color: "#000000", border: "2px solid #F0EDD4" }}>
          <div style={{whiteSpace: 'nowrap', overflowX: 'scroll', display: 'flex', flexDirection: 'row', height: '90%', width: '100%', marginBottom: '1rem'}}>
          {selectedCollection.map(item => {
            return(
              <div
              className="card card-color"
              style={{
                borderColor: "#f8f9fa",
                minWidth: '30%',
                display: 'flex',
                margin: '1rem'
              }}
              key={item._id}
            >
              <div className="card-body" style={{display: 'flex', flexDirection: 'column'}}>
                <h5 className="card-title" style={{textWrap: 'wrap'}}>
                  {item.subject.subjectCode} - {item.subject.subjectName} (
                  {item.subject.sessionType})
                </h5>
                <p className="card-text">{item.subject.lecturer.lecturerName}</p>
                {item.lectureHall.hallid && (
                  <p className="card-text">{item.lectureHall.hallid}</p>
                )}
                <p className="card-text">{`${item.startTime.name} - ${getEndTimeByDuration(item.startTime.name, item.subject.duration)}`}</p>
              </div>
              <div className="card-footer text-muted">
                {<button style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold"}}
                className=" btn btn-primary btn-sm float-right"
                onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(item,item.day,item.startTime);
                    setSelectedCollection([]);
                }}
                >
                Edit
                </button>}
                </div>
                </div>
            )
          }
          )}
          </div>
          <button style={{alignSelf: 'end', background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold", width: '5rem'}}
                className=" btn btn-primary btn-sm float-right"
                onClick={(e) => {
                    e.preventDefault();
                    setSelectedCollection([]);
                }}
                >
                Close
                </button>
          </div>
        </div>
      }
      {selectedCellData && (
        <AdminResEdit
          selectedCellData={selectedCellData}
          onClose={handleClose}
          updateData={fetchData}
        />
      )}
    </div>
  );
}

export default AdminResTimetable;
