import { api } from './api';
import type { components } from '../api/schema';

export type LoginInput = components['schemas']['loginDto'];
export type RegisterInput = components['schemas']['registerDto'];
export type UserMe = components['schemas']['MeResponseDto'];

export const authService = {
    async login(body: LoginInput) {
        const { data, error } = await api.POST('/auth/login', { body });
        if (error || !data) throw new Error('Credenciais inválidas ou erro no servidor');
        return data;
    },

    async register(body: RegisterInput) {
        const { data, error, response } = await api.POST('/auth/register', { body });
        if (error as unknown) {
            if (response.status === 409) {
                throw new Error('Este usuário já existe. Tente entrar na sua conta.');
            }
            throw new Error('Não foi possível criar a conta. Confira os dados e tente novamente.');
        }
        return data;
    },

    async logout() {
        const { data, error } = await api.POST('/auth/logout');
        if (error || !data) throw new Error('Erro ao encerrar sessão');
        return data;
    },

    async getMe(): Promise<UserMe | null> {
        const { data, error } = await api.GET('/auth/me');
        if (error || !data) return null;
        return data;
    },
};
