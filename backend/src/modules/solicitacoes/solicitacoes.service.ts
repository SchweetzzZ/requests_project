import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException, } from '@nestjs/common';
import { CriarSolicitacaoDto, AtualizarSolicitacaoDto, AlterarStatusSolicitacaoDto, FiltroSolicitacaoDto, } from './dto/solicitacao.dto';
import { eq, and, or, ilike, sql, type SQL, desc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../db/db.constants';
import { solicitacoes } from './schema/solicitacao.schema';
import { users } from '../auth/schema/schema';

@Injectable()
export class SolicitacoesService {
  constructor(@Inject(DRIZZLE) readonly db: DrizzleDB) { }

  async create(dto: CriarSolicitacaoDto, usuarioId: string) {
    const [criada] = await this.db.insert(solicitacoes).values({
      usuario_id: usuarioId,
      ...dto,
    }).returning();

    return criada;
  }

  async update(id: string, dto: AtualizarSolicitacaoDto, usuarioId: string) {
    const [existente] = await this.db.select().from(solicitacoes).where(eq(solicitacoes.id, id));

    if (!existente) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (existente.status !== 'Aberto') {
      throw new BadRequestException(
        "Apenas solicitações com status 'Aberto' podem ser editadas",
      );
    }

    if (existente.usuario_id !== usuarioId) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta solicitação',
      );
    }

    const [atualizada] = await this.db.update(solicitacoes).set({
      ...dto,
    }).where(eq(solicitacoes.id, id)).returning();

    return atualizada;
  }

  async delete(id: string, usuarioId: string) {
    const [existente] = await this.db.select().from(solicitacoes).where(eq(solicitacoes.id, id));

    if (!existente) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (existente.status !== 'Aberto') {
      throw new BadRequestException(
        "Apenas solicitações com status 'Aberto' podem ser excluídas",
      );
    }

    if (existente.usuario_id !== usuarioId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir esta solicitação',
      );
    }

    await this.db.delete(solicitacoes).where(eq(solicitacoes.id, id));

    return { message: 'Solicitação excluída com sucesso', id };
  }

  async updateStatus(id: string, dto: AlterarStatusSolicitacaoDto) {
    const [existente] = await this.db.select().from(solicitacoes).where(eq(solicitacoes.id, id));

    if (!existente) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    const [atualizada] = await this.db.update(solicitacoes).set({
      status: dto.status,
    }).where(eq(solicitacoes.id, id)).returning();

    return atualizada;
  }

  async findAll(filtros: FiltroSolicitacaoDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoria,
      status,
      data_inicio,
      data_fim,
    } = filtros;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search?.trim()) {
      const termo = search.trim();
      const porCodigo = /^(?:sol-?)?(\d{1,9})$/i.exec(termo);
      const filtroTitulo = ilike(solicitacoes.titulo, `%${termo}%`);

      conditions.push(
        porCodigo
          ? or(filtroTitulo, eq(solicitacoes.codigo, Number(porCodigo[1])))!
          : filtroTitulo,
      );
    }

    if (categoria) {
      conditions.push(eq(solicitacoes.categoria, categoria));
    }

    if (status) {
      conditions.push(eq(solicitacoes.status, status));
    }

    const diaCriacao = sql`(${solicitacoes.data_criacao} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date`;

    if (data_inicio) {
      conditions.push(sql`${diaCriacao} >= ${data_inicio}::date`);
    }

    if (data_fim) {
      conditions.push(sql`${diaCriacao} <= ${data_fim}::date`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(solicitacoes)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    const data = await this.db
      .select({
        id: solicitacoes.id,
        codigo: solicitacoes.codigo,
        titulo: solicitacoes.titulo,
        descricao: solicitacoes.descricao,
        categoria: solicitacoes.categoria,
        status: solicitacoes.status,
        data_criacao: solicitacoes.data_criacao,
        usuario_id: solicitacoes.usuario_id,
        solicitante: users.name,
      })
      .from(solicitacoes)
      .leftJoin(users, eq(solicitacoes.usuario_id, users.id))
      .where(whereClause)
      .orderBy(desc(solicitacoes.data_criacao))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id: string) {
    const [item] = await this.db
      .select({
        id: solicitacoes.id,
        codigo: solicitacoes.codigo,
        titulo: solicitacoes.titulo,
        descricao: solicitacoes.descricao,
        categoria: solicitacoes.categoria,
        status: solicitacoes.status,
        data_criacao: solicitacoes.data_criacao,
        usuario_id: solicitacoes.usuario_id,
        solicitante: users.name,
      })
      .from(solicitacoes)
      .leftJoin(users, eq(solicitacoes.usuario_id, users.id))
      .where(eq(solicitacoes.id, id));

    if (!item) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return item;
  }

  async getDashboard() {
    const [result] = await this.db
      .select({
        total: sql<number>`count(*)`,
        abertas: sql<number>`count(*) filter (where ${solicitacoes.status} = 'Aberto')`,
        emAtendimento: sql<number>`count(*) filter (where ${solicitacoes.status} = 'Em Atendimento')`,
        concluidas: sql<number>`count(*) filter (where ${solicitacoes.status} = 'Concluído')`,
      })
      .from(solicitacoes);

    return {
      total: Number(result?.total || 0),
      abertas: Number(result?.abertas || 0),
      emAtendimento: Number(result?.emAtendimento || 0),
      concluidas: Number(result?.concluidas || 0),
    };
  }
}
