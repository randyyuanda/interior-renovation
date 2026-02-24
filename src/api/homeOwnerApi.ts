import axios from "axios";
import type { HomeOwner, HomeOwnerPayload } from "../models/homeOwner";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3003",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getHomeOwnerApi = async (): Promise<HomeOwner[]> => {
  const response = await axiosInstance.get("/home_owners");
  return response.data;
};

export const createHomeOwnerApi = async (
  data: HomeOwnerPayload,
): Promise<HomeOwner> => {
  const response = await axiosInstance.post("/home_owners", data);
  return response.data;
};

export const updateHomeOwnerApi = async (
  id: number,
  data: HomeOwnerPayload,
): Promise<HomeOwner> => {
  const response = await axiosInstance.put(`/home_owners/${id}`, data);
  return response.data;
};

export const deleteHomeOwnerApi = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/home_owners/${id}`);
};
