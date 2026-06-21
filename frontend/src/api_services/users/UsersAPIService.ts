import client from "../axios/axiosClient";
import axios from "axios";
import type { IUsersAPIService, ApiResponse } from "./IUsersAPIService";
import type { CreateUserDto, UserListDto } from "../../models/user/UserTypes";

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e)
    ? ((e.response?.data as { message?: string })?.message ?? fallback)
    : fallback,
});

export const usersApi: IUsersAPIService = {
  async getAll() {
    return client
      .get<UserListDto[]>("/User")
      .then((r) => ({ success: true as const, data: r.data, message: "" }))
      .catch((e) => err<UserListDto[]>(e, "Failed to load users"));
  },
  async deleteUser(id: string) {
    return client
      .delete(`/User/${id}`)
      .then(() => ({ success: true as const, data: undefined, message: "" }))
      .catch((e) => err<undefined>(e, "Failed to delete user"));
  },
  async updateStatus(id: string, status: "Active" | "Suspended") {
    const accountStatusValue = status === "Suspended" ? 1 : 0;
    return client
      .patch(`/User/${id}/status`, { AccountStatus: accountStatusValue })
      .then(() => ({ success: true as const, data: undefined, message: "" }))
      .catch((e) => err<undefined>(e, "Failed to update user status"));
  },
  async create(dto: CreateUserDto) {
    return client
      .post<ApiResponse<void>>("/User", dto)
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to create user"));
  },
  async resetPasswordRequest(email: string) {
    return client
      .get<ApiResponse<void>>(`/User/reset-password`, { params: { email } })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to request password reset"));
  },
};
