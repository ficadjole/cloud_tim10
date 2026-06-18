import type { UserListDto, CreateUserDto } from "../../models/user/UserTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IUsersAPIService {
  getAll(): Promise<ApiResponse<UserListDto[]>>;
  deleteUser(id: string): Promise<ApiResponse<void>>;
  updateStatus(id: string, status: "Active" | "Suspended"): Promise<ApiResponse<void>>;
  create(dto: CreateUserDto): Promise<ApiResponse<void>>;
  resetPasswordRequest(email: string): Promise<ApiResponse<void>>;
}