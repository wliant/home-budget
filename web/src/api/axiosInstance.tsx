import axios from "axios";
import config from "../utils/config";

const axiosInstance = axios.create({
    baseURL: config.baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptors if needed (e.g., for authentication)
axiosInstance.interceptors.request.use(
    (request) => {
        // Modify request (e.g., add auth token) if needed
        return request;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally
        return Promise.reject(error);
    }
);

export default axiosInstance;
