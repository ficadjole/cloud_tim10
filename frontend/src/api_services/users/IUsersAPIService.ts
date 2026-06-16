import type { UserDto } from "../../models/user/UserTypes";
import type { CreateUserDto } from "../../models/user/UserTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IUsersAPIService {
  getAll(): Promise<ApiResponse<UserDto[]>>;
  getById(id: number): Promise<ApiResponse<UserDto>>;
  deactivate(id: number): Promise<ApiResponse<void>>;
  create(dto: CreateUserDto): Promise<ApiResponse<void>>;
  resetPasswordRequest(email: string): Promise<ApiResponse<void>>;
}


