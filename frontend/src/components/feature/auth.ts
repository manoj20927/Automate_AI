import api from "@/api";

export interface User {
  _id?: string;
  firebaseId?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  message: string;
  token?: string;
  user?: User;
}

export interface LogoutResponse {
  message: string;
}

export interface MeResponse {
  user?: User;
  message?: string;
}

export const loginUser = async (token: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/api/auth/login", {
    token,
  });
  return response.data;
};

export const logoutUser = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>("/api/auth/logout");
  return response.data;
};

export const me = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>("/api/auth/me");
  return response.data;
};

export { loginUser as login };
