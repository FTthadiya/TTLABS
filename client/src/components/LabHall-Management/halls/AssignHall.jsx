import Axios from 'axios';

const assignHall = async (timetable) => {
  const { day, subject, startTime } = timetable;


  const response = await fetch('http://localhost:3001/api/hall/getHalls');
  if (!response.ok) {
      throw new Error('Failed to fetch halls');
  }
  const hallsData = await response.json();

  const filteredHalls = hallsData.filter((hall) => hall.capacity >= subject.studentCount && hall.available === true);

  const response2 = await fetch('http://localhost:3001/api/assignhall/getAssignmentHalls');
  if (!response2.ok) {
      throw new Error('Failed to fetch hall assignments');
  }
  const assignments = await response2.json();


  let message = '';
  if (filteredHalls.length === 0) {
      message = `No halls available for ${subject.subjectCode} at ${startTime.name} on ${day.name}`;
  } else if (filteredHalls.length === 1) {
      const hall = filteredHalls[0];
      const endTimeIndex = startTime.index + subject.duration;
      //const exIndex = subject.duration - 1;
      //((assignment.timeIndex + exIndex) === (endTimeIndex-1))
      const overlappingAssignments = assignments.filter((assignment) => hall.hallid == assignment.hallid && assignment.day === day.name && (assignment.timeIndex === startTime.index || (assignment.timeIndex >= startTime.index && assignment.timeIndex < endTimeIndex)) && timetable.lectureHall.assigned === true);
      if (overlappingAssignments.length > 0) {
          message = `No halls available at ${startTime.name} to assign to ${subject.subjectCode} on ${day.name}`;
      } else {
          message = `Hall ID: ${hall.hallid}, of Capacity: ${hall.capacity} has been assigned as the hall for ${subject.subjectCode}`;

          try {
              const newHall = await Axios.post('http://localhost:3001/api/assignhall/createAssignmentHall', {
                  hallid: hall.hallid,
                  day: day.name,
                  startTime: startTime.name,
                  duration: subject.duration,
                  subjectCode: subject.subjectCode,
                  timeIndex: startTime.index,
              });

              const timetableData = await Axios.put(`http://localhost:3001/api/timetables/lectureHallUpdate/${timetable._id}`, {
                  _id: newHall._id,
                  hallid: hall.hallid,
                  capacity: hall.capacity,
                  assigned: true,
              });

              await Axios.put(`http://localhost:3001/api/restimetable/lectureHallUpdate/${timetable._id}`,{
                        _id: newHall._id,
                        hallid: hall.hallid,
                        capacity: hall.capacity,
                        assigned: true,
              });

          } catch (error) {
              console.log("normal hall error check", error);
          }
      }

  } else if (filteredHalls.length > 1) {
      let closestHall = null;
      let minDifference = Infinity;

      filteredHalls.forEach((hall) => {
          const difference = Math.abs(hall.capacity - subject.studentCount);
          if (difference < minDifference) {
            const endTimeIndex = startTime.index + subject.duration;
            //const exIndex = subject.duration - 1;
            const overlappingHallAssignments = assignments.filter((assignment) => assignment.hallid === hall.hallid && assignment.day === day.name && (assignment.timeIndex === startTime.index || (assignment.timeIndex >= startTime.index && assignment.timeIndex < endTimeIndex)));
              if (overlappingHallAssignments.length === 0) {
                  minDifference = difference;
                  closestHall = hall;
              }
          }
      });

      const updatedTimetableResponse = await Axios.get(`http://localhost:3001/api/timetables/${timetable._id}`);
      const updatedTimetable = updatedTimetableResponse.data;

      if ((closestHall) && (!updatedTimetable.lectureHall.assigned)) {
          message = `Hall ID: ${closestHall.hallid} of Capacity: ${closestHall.capacity} has been assigned as the hall for ${subject.subjectCode}`;
          try {
              const newHall = await Axios.post('http://localhost:3001/api/assignhall/createAssignmentHall', {
                  hallid: closestHall.hallid,
                  day: day.name,
                  startTime: startTime.name,
                  duration: subject.duration,
                  subjectCode: subject.subjectCode,
                  timeIndex: startTime.index,
              });

              const timetableData = await Axios.put(`http://localhost:3001/api/timetables/lectureHallUpdate/${timetable._id}`, {
                  _id: newHall._id, 
                  hallid: closestHall.hallid,
                  capacity: closestHall.capacity,
                  assigned: true,
              });

              await Axios.put(`http://localhost:3001/api/restimetable/lectureHallUpdate/${timetable._id}`,{
                _id: newHall._id,
                hallid: closestHall.hallid,
                capacity: closestHall.capacity,
                assigned: true,
             });

          } catch (error) {
              console.log("closest hall test error", error);
          }

      } else {
          message = `No halls available at ${startTime.name} to assign to ${subject.subjectCode} on ${day.name}`;
      }
  }

  return message;
}
  

export default assignHall;

