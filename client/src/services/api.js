import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "https://social-post-website.onrender.com/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const unwrapData = (response) => response.data;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
