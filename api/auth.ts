import {api} from './axios';
export type LoginPayload = {
    username: string;
    password: string;
};

export async function login(payload: LoginPayload) {
    const response = await api.post(`/auth/login`, payload);
    return response.data;
}
export async function refreshToken() {
    const response = await api.post(`/auth/refresh`);
    return response.data;
}