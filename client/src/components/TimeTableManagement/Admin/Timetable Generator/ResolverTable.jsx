import React, { useState, useEffect } from "react";
import _ from "lodash";
import { parse, addHours, format } from "date-fns";
import { getDays, getAllTimes } from "../../Services/DaysAndTimeService";
import "../../Css/table.css";

function ResolverTable({ timetableData, lecturersOtherSub, onRemove }) {
  const [gridData, setGridData] = useState(timetableData);
  const [days, setDays] = useState([]);
  const [times, setTimes] = useState([]);

  useEffect(() => {
    setGridData(timetableData);
  }, [timetableData]);

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

  const renderOtherSubjectsofLec = (day, time) => {
    if (!lecturersOtherSub) {
      return null;
    }
    const subject = lecturersOtherSub.find(
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

  const handleOnRemove = (timetableId) => {
    console.log(timetableId);
    onRemove(timetableId);
  };

  return (
    <div>
      <div className="container">
        <table
          className="table table-bordered text-center common-table"
          style={{ fontSize: 10, verticalAlign: "middle" }}
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
                            <div className="d-flex justify-content-end align-items-start">
                              <i
                                className="fa fa-times"
                                aria-hidden="true"
                                onClick={() => {
                                  handleOnRemove(data._id);
                                }}
                              ></i>
                            </div>
                            <br />
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
                      } else {
                        const otherData = renderOtherSubjectsofLec(day, time);
                        if (otherData) {
                          blockEmptyCell(otherData.subject, day, time);
                          return (
                            <td
                              key={otherData._id}
                              rowSpan={otherData.subject.duration}
                              className="bg-danger"
                            ></td>
                          );
                        }
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

export default ResolverTable;
