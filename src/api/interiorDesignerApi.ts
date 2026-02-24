import axios from "axios";
import type {
  InteriorDesigner,
  InteriorDesignerPayload,
} from "../models/interiorDesigner";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3002",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getInteriorDesignersApi = async (): Promise<
  InteriorDesigner[]
> => {
  const response = await axiosInstance.get("/interior_designers");
  return response.data;
};

export const createInteriorDesignerApi = async (
  data: InteriorDesignerPayload
): Promise<InteriorDesigner> => {
  const response = await axiosInstance.post("/interior_designers", data);
  return response.data;
};

export const updateInteriorDesignerApi = async (
  id: number,
  data: InteriorDesignerPayload
): Promise<InteriorDesigner> => {
  const response = await axiosInstance.put(`/interior_designers/${id}`, data);
  return response.data;
};

export const deleteInteriorDesignerApi = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/interior_designers/${id}`);
};
