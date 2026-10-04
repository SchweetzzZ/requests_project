import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, type LoginInput, type RegisterInput } from "../services/auth.service";
import { toast } from "sonner"

export function useAuth() {
    const queryClient = useQueryClient()

    const meQuery = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: authService.getMe,
        retry: false,
        staleTime: 1000 * 60 * 5,
    })

    const loginMutation = useMutation({
        mutationFn: async (data: LoginInput) => {
            await authService.login(data);
            const user = await authService.getMe();
            if (!user) {
                throw new Error('Não foi possível validar a sessão no navegador. Verifique as configurações de cookies.');
            }
            queryClient.setQueryData(['auth', 'me'], user);
            return user;
        },
        onSuccess: () => {
            toast.success('Login realizado com sucesso')
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Error ao realizar login')
        },
    })

    const registerMutation = useMutation({
        mutationFn: (data: RegisterInput) => authService.register(data),
        onSuccess: () => {
            toast.success('Cadastro realizado com sucesso')
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Error ao realizar cadastro')
        },
    })

    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onSuccess: () => {
            queryClient.setQueryData(['auth', 'me'], null)
            queryClient.clear()
            toast.success('Sessão encerrada!')
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Erro ao encerrar sessão')
        },
    })

    return {
        user: meQuery.data,
        isLoadingUser: meQuery.isLoading,
        isAuthenticated: !!meQuery.data,
        login: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        register: registerMutation.mutateAsync,
        isRegistering: registerMutation.isPending,
        logout: logoutMutation.mutateAsync,
        isLoggingOut: logoutMutation.isPending,
    };

}