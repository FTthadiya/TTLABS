import http from "./httpService";
import { apiUrl } from "../../../../config.json";

const apiEndpoint = apiUrl + "/timetables";

export function getSpecBatchTTData(specBatchId, reqBody) {
  return http.post(apiEndpoint + "/specBatch/" + specBatchId._id, reqBody);
}

export function getLecturerTTData(lecturerId, reqBody) {
  return http.post(apiEndpoint + "/lecturer/" + lecturerId.userId, reqBody);
}

export function saveTimetableData(timetableData) {
  return http.post(apiEndpoint, timetableData);
}

export function getUniqueYears() {
  return http.get(apiEndpoint + "/retrieve/uniqueYears");
}

export function getPreviousTimetables(reqBody) {
  return http.post(apiEndpoint + "/previousTimetables", reqBody);
}

export function regenerateTimetables() {
  return http.delete(apiEndpoint + "/delete/all");
}

export function getTimetableData(reqBody) {
  return http.post(apiEndpoint + "/getAll", reqBody);
}

export function deleteTimetableObj(timetableId) {
  return http.delete(apiEndpoint + "/" + timetableId);
}
