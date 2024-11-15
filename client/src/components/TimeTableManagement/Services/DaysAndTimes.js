import { addHours, format } from "date-fns";

export const days = [
  { _id: "addvadva", index: 1, name: "Monday" },
  { _id: "fbdsfb4", index: 2, name: "Tuesday" },
  { _id: "dsbfdfndf3", index: 3, name: "Wednesday" },
  { _id: "asasvadv2", index: 4, name: "Thursday" },
  { _id: "bsbfnt53ybf", index: 5, name: "Friday" },
];

export const times = [
  { _id: "dguwod45zsz", index: 1, name: "08:30" },
  { _id: "cbfnfdn34", index: 2, name: "09:30" },
  { _id: "xvzxxvzveg2", index: 3, name: "10:30" },
  { _id: "vzxvzbbe31325vsd", index: 4, name: "11:30" },
  { _id: "dsbnffdna", index: 5, name: "12:30" },
  { _id: "dsbbrb3tgbba", index: 6, name: "13:30" },
  { _id: "dsbfbabb", index: 7, name: "14:30" },
  { _id: "fgilfugwr2tt", index: 8, name: "15:30" },
  { _id: "hi890aihdip", index: 9, name: "16:30" },
];

export function getDays() {
  return days.filter((d) => d);
}

export function getAllTimes() {
  return times.filter((t) => t);
}

export function getTimes(duration) {
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
      times.push({ _id: i.toString(), name: formattedTime });
      i++;
    }
    startTime = addHours(startTime, 1);
  }

  startTime = lunchBreakEnd;
  while (startTime.getTime() <= endTime.getTime()) {
    if (addHours(startTime, duration) <= endTime) {
      const formattedTime = format(startTime, pattern);
      times.push({ _id: i.toString(), name: formattedTime });
      i++;
    }
    startTime = addHours(startTime, 1);
  }

  return times;
}
