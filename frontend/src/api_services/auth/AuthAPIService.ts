import client from "../axios/axiosClient";
import axios from "axios";
import type { LoginResult } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";

const err = (e: unknown, fallback: string): LoginResult => ({
  success: false,
  message: axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ?? fallback
    : fallback,
});

export const authApi: IAuthAPIService = {
  async login(email, password) {
    return client
      .post<LoginResult>("/auth/login", { email, password })
      .then((r) => r.data)
      .catch((e) => err(e, "Login failed"));
  },
};