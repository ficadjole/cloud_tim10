import client from "../axios/axiosClient";
import axios from "axios";
import type { IUsersAPIService, ApiResponse } from "./IUsersAPIService";
import type { CreateUserDto, UserDto } from "../../models/user/UserTypes";

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ?? fallback
    : fallback,
});

export const usersApi: IUsersAPIService = {
  async getAll() {
    return client.get<ApiResponse<UserDto[]>>("/users")
      .then(r => r.data).catch(e => err(e, "Failed to load users"));
  },
  async getById(id) {
    return client.get<ApiResponse<UserDto>>(`/users/${id}`)
      .then(r => r.data).catch(e => err(e, "Failed to load user"));
  },
  async deactivate(id) {
    return client.patch<ApiResponse<void>>(`/users/${id}/deactivate`, {})
      .then(r => r.data).catch(e => err(e, "Failed to deactivate user"));
  },
  async create(dto: CreateUserDto) {
  return client.post<ApiResponse<void>>("/CreateUser", dto)
    .then(r => r.data).catch(e => err(e, "Failed to create user"));
},
};