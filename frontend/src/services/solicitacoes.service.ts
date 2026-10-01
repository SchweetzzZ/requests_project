import { api } from './api';
import type { components, operations } from '../api/schema';

//Inputs
export type CriarSolicitacaoInput = components['schemas']['CriarSolicitacaoDto'];
export type AtualizarSolicitacaoInput = components['schemas']['AtualizarSolicitacaoDto'];
export type AlterarStatusInput = components['schemas']['AlterarStatusSolicitacaoDto'];
export type FiltrosSolicitacao = operations['SolicitacoesController_findAll']['parameters']['query'];

//Responses
export type SolicitacaoItem = components['schemas']['SolicitacaoResponseDto'];
export type ListagemSolicitacoesResponse = components['schemas']['ListagemSolicitacoesResponseDto'];
export type DashboardResponse = components['schemas']['DashboardResponseDto'];
export type ExcluirSolicitacaoResponse = components['schemas']['ExcluirSolicitacaoResponseDto'];

export const solicitacoesService = {
  async getDashboard() {
    const { data, error } = await api.GET('/solicitacoes/dashboard');
    if (error || !data) {
      throw new Error('Falha ao carregar métricas do dashboard');
    }
    return data;
  },

  async findAll(filtros?: FiltrosSolicitacao) {
    const { data, error } = await api.GET('/solicitacoes', {
      params: { query: filtros },
    });
    if (error || !data) {
      throw new Error('Falha ao listar solicitações');
    }
    return data;
  },

  async create(body: CriarSolicitacaoInput) {
    const { data, error } = await api.POST('/solicitacoes', { body });
    if (error || !data) {
      throw new Error('Falha ao criar solicitação');
    }
    return data;
  },

  async update(id: string, body: AtualizarSolicitacaoInput) {
    const { data, error } = await api.PATCH('/solicitacoes/{id}', {
      params: { path: { id } },
      body,
    });
    if (error || !data) {
      throw new Error('Falha ao atualizar solicitação (Apenas chamados abertos podem ser editados pelo criador)');
    }
    return data;
  },

  async updateStatus(id: string, status: AlterarStatusInput['status']) {
    const { data, error } = await api.PATCH('/solicitacoes/{id}/status', {
      params: { path: { id } },
      body: { status },
    });
    if (error || !data) {
      throw new Error('Falha ao alterar status da solicitação');
    }
    return data;
  },

  async delete(id: string) {
    const { data, error } = await api.DELETE('/solicitacoes/{id}', {
      params: { path: { id } },
    });
    if (error || !data) {
      throw new Error('Falha ao excluir solicitação (Apenas chamados abertos podem ser excluídos pelo criador)');
    }
    return data;
  },
};
