import axios from "axios";

// In production, always use relative "/api" so requests go to the same origin without CORS or localhost issues.
// In development, Vite dev server proxies "/api" to backend port 5000.
const baseURL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
