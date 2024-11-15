import http from "./httpService";
import { apiUrl } from "../../../../config.json";
import { addHours, format } from "date-fns";

export function getDays() {
  return http.get(apiUrl + "/days");
}

export function getAllTimes() {
  return http.get(apiUrl + "/startTimes");
}

export function getTimes(allTimes, duration) {
  const pattern = "HH:mm";
  let startTime = new Date();
  startTime.setHours(8, 30, 0);

  const lunchBreakStart = new Date();
  lunchBreakStart.setHours(12, 30, 0);

  const lunchBreakEnd = new Date();
  lunchBreakEnd.setHours(13, 30, 0);

  const endTime = new Date();
  endTime.setHours(17, 30, 0);

  let i = 0;
  const times = [];

  while (startTime.getTime() <= lunchBreakStart.getTime()) {
    if (addHours(startTime, duration) <= lunchBreakStart) {
      const formattedTime = format(startTime, pattern);
      const timeId = allTimes.find((t) => t.name === formattedTime)._id;
      times.push({ _id: timeId, name: formattedTime });
      i++;
    }
    startTime = addHours(startTime, 1);
  }

  startTime = lunchBreakEnd;
  while (startTime.getTime() <= endTime.getTime()) {
    if (addHours(startTime, duration) <= endTime) {
      const formattedTime = format(startTime, pattern);
      const timeId = allTimes.find((t) => t.name === formattedTime)._id;
      times.push({ _id: timeId, name: formattedTime });
      i++;
    }
    startTime = addHours(startTime, 1);
  }

  return times;
}
