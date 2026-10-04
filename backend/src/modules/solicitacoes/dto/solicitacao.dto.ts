import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CATEGORIAS_SOLICITACAO = [
  'TI',
  'RH',
  'Compras',
  'Financeiro',
  'Infraestrutura',
] as const;

export const STATUS_SOLICITACAO = [
  'Aberto',
  'Em Atendimento',
  'Concluído',
] as const;

const criarSolicitacaoSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  categoria: z.enum(CATEGORIAS_SOLICITACAO, {
    error:
      'Categoria inválida. Categorias permitidas: TI, RH, Compras, Financeiro, Infraestrutura',
  }),
});

const atualizarSolicitacaoSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres').optional(),
  descricao: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres').optional(),
  categoria: z.enum(CATEGORIAS_SOLICITACAO, { error: 'Categoria inválida. Categorias permitidas: TI, RH, Compras, Financeiro, Infraestrutura' }).optional(),
});

const alterarStatusSolicitacaoSchema = z.object({
  status: z.enum(STATUS_SOLICITACAO, {
    error:
      'Status inválido. Status permitidos: Aberto, Em Atendimento, Concluído',
  }),
});

const filtroSolicitacaoSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    search: z.string().optional(),
    categoria: z.enum(CATEGORIAS_SOLICITACAO).optional(),
    status: z.enum(STATUS_SOLICITACAO).optional(),
    data_inicio: z.iso
      .date('Data inicial inválida. Use o formato AAAA-MM-DD')
      .optional(),
    data_fim: z.iso
      .date('Data final inválida. Use o formato AAAA-MM-DD')
      .optional(),
  })
  .refine(
    (filtros) =>
      !filtros.data_inicio ||
      !filtros.data_fim ||
      filtros.data_inicio <= filtros.data_fim,
    {
      message: 'A data inicial não pode ser posterior à data final',
      path: ['data_fim'],
    },
  );

export class CriarSolicitacaoDto extends createZodDto(criarSolicitacaoSchema) { }
export class AtualizarSolicitacaoDto extends createZodDto(
  atualizarSolicitacaoSchema,
) { }
export class AlterarStatusSolicitacaoDto extends createZodDto(
  alterarStatusSolicitacaoSchema,
) { }
export class FiltroSolicitacaoDto extends createZodDto(
  filtroSolicitacaoSchema,
) { }

export const solicitacaoResponseSchema = z.object({
  id: z.string().uuid(),
  codigo: z.number().int(),
  titulo: z.string(),
  descricao: z.string(),
  categoria: z.enum(CATEGORIAS_SOLICITACAO),
  status: z.enum(STATUS_SOLICITACAO),
  data_criacao: z.string(),
  usuario_id: z.string().uuid(),
  solicitante: z.string().nullable(),
});

export const listagemSolicitacoesResponseSchema = z.object({
  data: z.array(solicitacaoResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const dashboardResponseSchema = z.object({
  total: z.number(),
  abertas: z.number(),
  emAtendimento: z.number(),
  concluidas: z.number(),
});

export const excluirSolicitacaoResponseSchema = z.object({
  message: z.string(),
  id: z.string(),
});

export class SolicitacaoResponseDto extends createZodDto(
  solicitacaoResponseSchema,
) { }
export class ListagemSolicitacoesResponseDto extends createZodDto(
  listagemSolicitacoesResponseSchema,
) { }
export class DashboardResponseDto extends createZodDto(
  dashboardResponseSchema,
) { }
export class ExcluirSolicitacaoResponseDto extends createZodDto(
  excluirSolicitacaoResponseSchema,
) { }
