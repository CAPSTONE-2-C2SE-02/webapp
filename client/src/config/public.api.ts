import axios from "axios";

const BASE_API = import.meta.env.VITE_API_URL;

const publicApi = axios.create({
  baseURL: BASE_API,
  headers: {
    "Content-Type": "application/json",
  }
});

publicApi.interceptors.request.use(
  async (config) => config,
  (error) => {
    return Promise.reject(error);
  }
)

publicApi.interceptors.response.use(
  (response) => {
    if (response && response.data) return response
    return response;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

export default publicApi;