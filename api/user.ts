import {api} from './axios';

export async function getMe() {
    const response = await api.get(`/auth/me`);
    return response.data;
}