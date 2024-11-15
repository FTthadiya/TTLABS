import Axios from "axios";

const assignLab = async (timetable) => {
  const { day, subject, startTime } = timetable;

  const response = await fetch("http://localhost:3001/api/lab/getLabs");
  if (!response.ok) {
    throw new Error("Failed to fetch Labs");
  }
  const LabsData = await response.json();

  const filteredLabs = LabsData.filter(
    (Lab) => Lab.capacity >= subject.studentCount && Lab.available === true
  );

  const response2 = await fetch(
    "http://localhost:3001/api/assignlab/getAssignmentLabs"
  );
  if (!response2.ok) {
    throw new Error("Failed to fetch Lab assignments");
  }
  const assignments = await response2.json();

  let message = "";
  if (filteredLabs.length === 0) {
    message = `No Labs available for ${subject.subjectCode} at ${startTime.name} on ${day.name}`;
  } else if (filteredLabs.length === 1) {
    const Lab = filteredLabs[0];
    const endTimeIndex = startTime.index + subject.duration;
    //const exIndex = subject.duration - 1;
    const overlappingAssignments = assignments.filter(
      (assignment) =>
        Lab.labid == assignment.labid &&
        assignment.day === day.name &&
        (assignment.timeIndex === startTime.index || (assignment.timeIndex >= startTime.index && assignment.timeIndex < endTimeIndex)) &&
        timetable.lectureHall.assigned === true
    );
    if (overlappingAssignments.length > 0) {
      message = `All available Labs for ${startTime.name} have been assigned to ${subject.subjectCode} on ${day.name}`;
    } else {
      message = `Lab ID: ${Lab.labid}, of Capacity: ${Lab.capacity} has been assigned as the Lab for ${subject.subjectCode}`;

      try {
        const newHall = Axios.post(
          "http://localhost:3001/api/assignlab/createAssignmentLab",
          {
            labid: Lab.labid,
            day: day.name,
            startTime: startTime.name,
            duration: subject.duration,
            subjectCode: subject.subjectCode,
            timeIndex: startTime.index,
          }
        );

        const timetableData = await Axios.put(
          `http://localhost:3001/api/timetables/lectureHallUpdate/${timetable._id}`,
          {
            _id: newHall._id,
            hallid: Lab.labid,
            capacity: Lab.capacity,
            assigned: true,
          }
        );

        await Axios.put(
          `http://localhost:3001/api/restimetable/lectureHallUpdate/${timetable._id}`,
          {
            _id: newHall._id,
            hallid: hall.hallid,
            capacity: hall.capacity,
            assigned: true,
          }
        );
      } catch (error) {
        console.log("normal Lab error check", error);
      }
    }
  } else if (filteredLabs.length > 1) {
    let closestLab = null;
    let minDifference = Infinity;

    filteredLabs.forEach((Lab) => {
      const difference = Math.abs(Lab.capacity - subject.studentCount);
      if (difference < minDifference) {
        const endTimeIndex = startTime.index + subject.duration;
        //const exIndex = subject.duration - 1;
        const overlappingLabAssignments = assignments.filter(
          (assignment) =>
            assignment.Labid === Lab.Labid &&
            assignment.day === day.name &&
            (assignment.timeIndex === startTime.index || (assignment.timeIndex >= startTime.index && assignment.timeIndex < endTimeIndex))
        );
        if (overlappingLabAssignments.length === 0) {
          minDifference = difference;
          closestLab = Lab;
        }
      }
    });

    const updatedTimetableResponse = await Axios.get(
      `http://localhost:3001/api/timetables/${timetable._id}`
    );
    const updatedTimetable = updatedTimetableResponse.data;

    if (closestLab && !updatedTimetable.lectureHall.assigned) {
      message = `Lab ID: ${closestLab.labid} of Capacity: ${closestLab.capacity} has been assigned as the Lab for ${subject.subjectCode}`;
      try {
        const newHall = await Axios.post(
          "http://localhost:3001/api/assignlab/createAssignmentLab",
          {
            labid: closestLab.labid,
            day: day.name,
            startTime: startTime.name,
            duration: subject.duration,
            subjectCode: subject.subjectCode,
            timeIndex: startTime.index,
          }
        );

        const timetableData = await Axios.put(
          `http://localhost:3001/api/timetables/lectureHallUpdate/${timetable._id}`,
          {
            _id: newHall._id,
            hallid: closestLab.labid,
            capacity: closestLab.capacity,
            assigned: true,
          }
        );

        await Axios.put(
          `http://localhost:3001/api/restimetable/lectureHallUpdate/${timetable._id}`,
          {
            _id: newHall._id,
            hallid: closestLab.hallid,
            capacity: closestLab.capacity,
            assigned: true,
          }
        );
      } catch (error) {
        console.log("closest Lab test error", error);
      }
    } else {
      message = `All available Labs for ${startTime.name} have been assigned to ${subject.subjectCode} on ${day.name}`;
    }
  }

  return message;
};

export default assignLab;
