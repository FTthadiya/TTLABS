import http from "./httpService";
import { apiUrl } from "../../../../config.json";

const apiEndpoint = apiUrl + "/subjects";

export function getSubjects() {
  return http.get(apiEndpoint);
}
export function getSubject(subjectId) {
  return http.get(apiEndpoint + "/" + subjectId);
}

export function getLecturerSubjects(lecturerId) {
  return http.get(apiEndpoint + "/lecturer/" + lecturerId);
}

export function saveSubject(subject) {
  if (subject._id) {
    const { _id, selectedBatches, ...body } = { ...subject };
    return http.put(apiEndpoint + "/" + subject._id, body);
  } else if (!subject._id && subject.selectedBatches) {
    const { selectedBatches, ...body } = { ...subject };
    return http.post(apiEndpoint, body);
  }
  return http.post(apiEndpoint, subject);
}

export function deleteSubject(subjectId) {
  return http.delete(apiEndpoint + "/" + subjectId);
}
