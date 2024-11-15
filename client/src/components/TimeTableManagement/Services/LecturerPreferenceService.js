import http from "./httpService";
import { apiUrl } from "../../../../config.json";

const apiEndpoint = apiUrl + "/lecturerPreferences";

export function getLecturerPreferences() {
  return http.get(apiEndpoint);
}

export function saveLecturerPreference(lecturerPreference) {
  return http.post(apiEndpoint, lecturerPreference);
}

export function deleteLecturerPreferences() {
  return http.delete(apiEndpoint);
}
