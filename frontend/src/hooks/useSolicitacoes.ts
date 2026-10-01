import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { solicitacoesService, type CriarSolicitacaoInput, type AtualizarSolicitacaoInput, type AlterarStatusInput, type FiltrosSolicitacao } from '../services/solicitacoes.service';
import { toast } from 'sonner';


export function useDashboard() {
  return useQuery({
    queryKey: ['solicitacoes', 'dashboard'],
    queryFn: () => solicitacoesService.getDashboard(),
  });
}

export function useSolicitacoes(filtros?: FiltrosSolicitacao) {
  return useQuery({
    queryKey: ['solicitacoes', 'list', filtros],
    queryFn: () => solicitacoesService.findAll(filtros),
  });
}

export function useCriarSolicitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CriarSolicitacaoInput) => solicitacoesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação criada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar solicitação');
    },
  });
}

export function useAtualizarSolicitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AtualizarSolicitacaoInput }) =>
      solicitacoesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação atualizada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar solicitação');
    },
  });
}

export function useAlterarStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AlterarStatusInput['status'] }) =>
      solicitacoesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao alterar status');
    },
  });
}

export function useExcluirSolicitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => solicitacoesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação excluída com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao excluir solicitação');
    },
  });
}