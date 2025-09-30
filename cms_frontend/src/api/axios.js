import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api/", // Django backend
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token"); // or Redux/Zustand state
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
