export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  accountStatus: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthError {
  success: false;
  message: string;
}

export type LoginResult = AuthResponse | AuthError;

export const isAuthError = (r: LoginResult): r is AuthError =>
  "success" in r && !(r as AuthError).success;