import http from "./httpService";
import { apiUrl } from "./../../../../config.json";

export function getLecturers() {
  return http.get(apiUrl + "/lecturers");
}

export function deleteLecturer(lecturerId) {
  return http.delete(apiUrl + "/lecturers/" + lecturerId);
}
