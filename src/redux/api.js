import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    // "Content-Type": "multipart/form-data",
  },
});


function getCookie() {
  const userCookie = Cookies.get("pipeSpool");
  return userCookie;
}



// --------------------------- REQUEST INTERCEPTOR // ---------------------------
API.interceptors.request.use((config) => {
  // const userCookie = Cookies.get("pipeSpool");
  const userCookie = getCookie();
  let token = null;

  if (userCookie) {
    token = userCookie;
  } else {
    Cookies.remove("pipeSpool");
  }
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else {
    delete config.headers["Authorization"];
  }
  return config;
}, (error) => Promise.reject(error)
);

// --------------------------- RESPONSE INTERCEPTOR  ---------------------------
API.interceptors.response.use((response) => response, (error) => {
  const message = error?.response?.data?.message;

  if (message === "Unauthenticated." || error?.response?.status === 401) {
    toast.error("Token Expired");
    Cookies.remove("pipeSpool");  
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  }
  return Promise.reject(error);
});

// --------------------------- API FUNCTIONS ---------------------------

export const loginApi = (formData) => API.post("/login", formData);
export const getAllEntity = (formData) => API.post("/get_all_user_entity", formData)
export const selectEntity = (formData) => API.post("/change_entity", formData)

export const spoolsApi = (formData) => API.post('project_details', formData)
export const fetchSpoolsApi = (formData) => API.post('/spool_details', formData)
export const fetchSpoolsDrawingApi = (formData) => API.post('/spool_drawing', formData)


// Task  START END PAUSE RESUME
export const startComplateTaskApi = (formData) => API.post('/start_or_complete_task', formData)
export const pauseResumeTaskApi = (formData) => API.post('/pause_or_resume_task', formData)
export const reportTaskApi = (formData) => API.post('/report_issue', formData)

// Notification
export const getNotification = (formData) => API.post('/get_notifications', formData)
export const readNotification = (formData) => API.post('/read_notification', formData)
