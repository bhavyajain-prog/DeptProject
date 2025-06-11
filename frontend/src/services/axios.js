import axios from "axios";

const instance = axios.create({
  // baseURL: "https://project-allocation-process-and-evaluation.onrender.com",
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

export default instance;
