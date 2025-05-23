import axios from "axios";

const instance = axios.create({
  baseURL: "https://project-allocation-process-and-evaluation.onrender.com",
  withCredentials: true,
});

export default instance;
