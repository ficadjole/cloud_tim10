export type UserDto = {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: number;
};

export type UserRole = "SysAdmin" | "PaymentAdmin" | "User";

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
}
