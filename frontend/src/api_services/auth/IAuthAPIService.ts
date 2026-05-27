import type { LoginResult } from "../../types/auth/AuthResponse";

export interface IAuthAPIService {
  login(email: string, password: string): Promise<LoginResult>;
}