import { removeAccessToken } from '@/utils/cookies';
import {api} from './axios';
export type LoginPayload = {
    username: string;
    password: string;
};

export async function login(payload: LoginPayload) {
    const response = await api.post(`/auth/login`, payload);
    return response.data;
}

export async function logout() {
    try{

        const response = await api.post(`/auth/logout`);
        return response.data;
    }
    catch (err) {
    console.error('Error during logout:', err);
    }
    finally {
        removeAccessToken();
        window.location.href = '/login';
    }
}