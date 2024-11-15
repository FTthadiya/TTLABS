import http from "./httpService";
import { apiUrl } from "./../../../../config.json";

export function getSpecBatches() {
  return http.get(apiUrl + "/specBatches");
}

export function deleteSpecBatch(specBatchId) {
  return http.delete(apiUrl + "/specBatches/" + specBatchId);
}

export function saveBatch(batch) {
  if (batch._id) {
    const { _id, ...body } = { ...batch };
    return http.put(apiUrl + "/specBatches/" + batch._id, body);
  }
  return http.post(apiUrl + "/specBatches", batch);
}

export function getSpecNames() {
  return http.get(apiUrl + "/specBatches/api/uniqueSpecs");
}

export function getBatchNames() {
  return http.get(apiUrl + "/specBatches/api/uniqueBatches");
}

export function getSpecBatchId(body) {
  return http.post(apiUrl + "/specBatches/api/specBatchId", body);
}
