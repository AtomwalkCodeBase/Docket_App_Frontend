import { getProcessListUrl , getDocumentTypeListUrl, getProcessActivityListUrl, getActivityDocumentListUrl, processActivityDocument, getActivityEmailListUrl, processActivityEmailUrl,
  getCustomerListURL,getReimbursementOrderListURL,getProductListURL,ProcessReimbursementOrder,ProcessGovtFeeAttachement
 } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosget, authAxiosPatch, authAxiosPost, authAxiosPut } from "./HttpMethod";



// Document Management APIs

export function getProcessList(data = {}) {
  return authAxios(getProcessListUrl, data);
}

export function getDocumentTypeList(data = {}) {
  return authAxios(getDocumentTypeListUrl, data);
}

export function getActivityDocumentList(data = {}) {
  return authAxios(getActivityDocumentListUrl, data);
}

export function addActivityDocument(data = {}) {
  return authAxiosPost(processActivityDocument, data);
}

export function updateActivityDocument(data = {}) {
    return authAxiosPost(processActivityDocument, data);
}
export function getProcessActivityList(data) {
  return authAxios(getProcessActivityListUrl, data);
} 

export function getActivityEmailList(data = {}) {
  return authAxios(getActivityEmailListUrl, data);
}

export function processActivityEmail(data = {}) {
  return authAxiosPost(processActivityEmailUrl, data);
}

export function getCustomerListView(params) {
  return authAxios(getCustomerListURL, params)
}

export function getReimbursementOrderList(data = {}) {
  return authAxios(getReimbursementOrderListURL, data);
}

export function getProductList(data = {}) {
  return authAxios(getProductListURL, data);
}

export function createReimbursementOrder(data = {}) {
  return authAxiosPost(ProcessReimbursementOrder, data);
}

export function uploadGovtFeeAttachment(data = {}) {
  return authAxiosPost(ProcessGovtFeeAttachement, data);
}