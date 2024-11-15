import React, { useState, useEffect } from "react";
import _ from "lodash";
import { parse, addHours, format } from "date-fns";
import { getDays, getAllTimes } from "../Services/DaysAndTimeService";
import "../Css/table.css";
import CCLogo from "../../../assets/timetableManagement/curtin_colombo.jpg";

function TimetableGrid({ timetableData: data, messageData = null }) {
  const [gridData, setGridData] = useState(data);
  const [days, setDays] = useState([]);
  const [times, setTimes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await handleRenderDaysAndTimes();
    };
    fetchData();
  }, []);

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

  let emptyCells = [];

  const renderCell = (day, time) => {
    const subject = gridData.find(
      (data) => data.day._id === day._id && data.startTime._id === time._id
    );
    return subject ? subject : null;
  };

  const getEndTime = (time) => {
    const parsedTime = parse(time.name, "HH:mm", new Date());
    const endTime = addHours(parsedTime, 1);
    return format(endTime, "HH:mm");
  };

  const blockEmptyCell = (subject, day, time) => {
    const duration = subject.duration;
    let timeIndex = time.index;
    for (let i = 1; i < duration; i++) {
      const blockedCell = {
        dayId: day._id,
        timeId: _.get(_.find(times, { index: timeIndex + i }), "_id", null),
      };
      emptyCells.push(blockedCell);
    }
  };

  return (
    <div>
      <div className="container">
        {messageData && (
          <div
            className="row text-dark"
            style={{ fontSize: "10px", fontWeight: "bold" }}
          >
            <div className="col">
              <p style={{ marginBottom: "0", marginTop: "0" }}>
                Curtin Colombo
              </p>
              <p
                style={{ marginBottom: "0", marginTop: "0" }}
              >{`${messageData.specName} - Year ${messageData.year} Semester ${messageData.semester}`}</p>
              <p>{messageData.timePeriod}</p>
            </div>
            <div className="col-auto d-flex justify-content">
              <img
                src={CCLogo}
                style={{ width: "200px", height: "36px" }}
                alt="Loading"
              />
            </div>
          </div>
        )}
        <table
          className="table table-bordered text-center common-table"
          style={{
            fontSize: 10,
            verticalAlign: "middle",
          }}
        >
          <thead>
            <tr>
              <th scope="col">Time</th>
              {days.map((day) => (
                <th key={day._id} scope="col">
                  {day.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <React.Fragment key={time._id}>
                {time.name === "12:30" ? (
                  <tr>
                    <th scope="row" className="col-1">
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
                    <th scope="row" className="col-1">
                      {time.name}-{getEndTime(time)}
                    </th>
                    {days.map((day) => {
                      const data = renderCell(day, time);
                      if (data) {
                        blockEmptyCell(data.subject, day, time);
                        return (
                          <td key={data._id} rowSpan={data.subject.duration}>
                            {data.subject.subjectCode} -{" "}
                            {data.subject.subjectName} (
                            {data.subject.sessionType})
                            <br />
                            {data.subject.lecturer.lecturerName}
                            <br />
                            {data.lectureHall.hallid
                              ? data.lectureHall.hallid
                              : ""}
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
                        return <td key={_.uniqueId()}></td>;
                      })();
                    })}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TimetableGrid;
