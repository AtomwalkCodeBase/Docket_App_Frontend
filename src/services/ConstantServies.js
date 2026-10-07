const localhost = "https://www.atomwalk.com"
const newlocalhost = "https://crm.atomwalk.com"
const apiURL = "/api";
const db_name = localStorage.getItem("dbName");
export const endpoint = `${localhost}${apiURL}`;
export const hrendpoint = `${newlocalhost}/api`;
export const newhrendpoint = `${newlocalhost}/hr_api`;

export const userSignUpURL = `${endpoint}/customer_sign_up/${db_name}/`;
export const userLoginURL = `${endpoint}/customer_login/${db_name}/`;
export const loginURL = `${localhost}/rest-auth/login/`;

export const getCustomerDetailListURL = `${endpoint}/customer_detail_list/${db_name}/`;
export const profileInfoURL = `${endpoint}/profile_info/${db_name}/`;

export const getProcessActivityListUrl = `${hrendpoint}/get_process_activity_list/${db_name}/`;
export const getProcessListUrl = `${hrendpoint}/get_process_list/${db_name}/`;
export const getDocumentTypeListUrl = `${hrendpoint}/get_document_type_list/${db_name}/`;
export const getActivityDocumentListUrl = `${hrendpoint}/get_activity_document_list/${db_name}/`;
export const processActivityDocument = `${hrendpoint}/process_activity_document/${db_name}/`;
export const getActivityEmailListUrl = `${hrendpoint}/get_activity_email_list/${db_name}/`;
export const processActivityEmailUrl  = `${hrendpoint}/process_activity_email/${db_name}/`;

export const getCustomerListURL = `${hrendpoint}/customer_list/${db_name}/`;
export const getReimbursementOrderListURL = `${hrendpoint}/reimbursement_order_list/${db_name}/`
export const getProductListURL = `${hrendpoint}/products/${db_name}/`
export const ProcessReimbursementOrder = `${hrendpoint}/reimbursement_order/create/${db_name}/`
export const ProcessGovtFeeAttachement = `${hrendpoint}/reimbursement_order/upload/${db_name}/`