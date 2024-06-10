import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://fakestoreapi.com/",
});

export const axiosStorageInstance = axios.create({
  baseURL: "http://your-api-url.com/api",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosStorageInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
