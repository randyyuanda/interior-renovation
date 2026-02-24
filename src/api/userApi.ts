import axios from "axios";
import type { User, Role } from "../models/auth";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UserPayload {
  email: string;
  password?: string;
  role: Role;
}

export const getUsersApi = async (): Promise<User[]> => {
  const response = await axiosInstance.get("/users");
  return response.data;
};

export const createUserApi = async (data: UserPayload): Promise<User> => {
  const response = await axiosInstance.post("/users", data);
  return response.data;
};

export const updateUserApi = async (
  id: number,
  data: Partial<UserPayload>,
): Promise<User> => {
  const response = await axiosInstance.patch(`/users/${id}`, data);
  return response.data;
};

export const deleteUserApi = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};
