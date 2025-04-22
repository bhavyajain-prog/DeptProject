import axios from "axios";

const instance = axios.create({
  /*import.meta.env.BASE_URL || */
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

export default instance;
