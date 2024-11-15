import http from "./httpService";
import { apiUrl } from "../../../../config.json";

const apiEndpoint = apiUrl + "/functionalities";

export function getFunctionalities(functionName) {
  return http.get(apiEndpoint + "/" + functionName);
}

export function updateFunctionality(functionName, body) {
  return http.put(apiEndpoint + "/" + functionName, body);
}
