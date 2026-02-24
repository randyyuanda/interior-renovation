import axios from "axios";
import type { AuthResponse, LoginCredentials } from "../models/auth";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const loginApi = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await axiosInstance.post<{ accessToken: string }>(
    "/login",
    credentials,
  );

  const { accessToken } = response.data;

  const payload = JSON.parse(atob(accessToken.split(".")[1]));
  const userId: number = payload.sub;

  const userResponse = await axiosInstance.get(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return {
    accessToken,
    user: {
      id: userId,
      email: userResponse.data.email,
      role: userResponse.data.role,
    },
  };
};
