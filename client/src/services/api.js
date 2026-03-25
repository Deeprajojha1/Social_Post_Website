import axios from "axios";
import { navigateToLogin } from "./navigation";

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
    const requestUrl = error?.config?.url || "";
    const isInitialAuthCheck = requestUrl.includes("/auth/me");

    if (
      status === 401 &&
      !isInitialAuthCheck
    ) {
      navigateToLogin();
    }
    return Promise.reject(error);
  }
);
