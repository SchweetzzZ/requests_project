import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from '../src/app.module';
import { runMigrations } from '../src/modules/db/migrate';

interface SolicitacaoBody {
  id: string;
  codigo: number;
  titulo: string;
  status: string;
  solicitante: string | null;
}

interface ListagemBody {
  data: SolicitacaoBody[];
}

describe('Fluxo de Solicitações e Auth (Teste de Integração)', () => {
  let app: INestApplication;
  let token: string;
  let solicitacaoId: string;
  let solicitacaoCodigo: number;

  const server = () => app.getHttpServer() as Parameters<typeof request>[0];

  const uniqueSuffix = Date.now();
  const testUser = `dev_jr_${uniqueSuffix}`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    // Garante que a estrutura de tabelas existe no banco antes de rodar os testes
    if (process.env.DATABASE_URL) {
      await runMigrations();
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mesmos middlewares utilizados em produção (main.ts)
    app.use(cookieParser());
    app.useGlobalPipes(new ZodValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Autenticação', () => {
    it('POST /auth/register - deve registrar um novo usuário com sucesso', async () => {
      const response = await request(server())
        .post('/auth/register')
        .send({
          user: testUser,
          password: testPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect((response.body as { name: string }).name).toBe(testUser);
    });

    it('POST /auth/login - deve autenticar e retornar access_token', async () => {
      const response = await request(server())
        .post('/auth/login')
        .send({
          user: testUser,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      token = (response.body as { access_token: string }).access_token;
    });
  });

  describe('2. Solicitações & Regras de Negócio', () => {
    it('POST /solicitacoes - deve bloquear criação se o usuário não estiver autenticado (401)', async () => {
      await request(server())
        .post('/solicitacoes')
        .send({
          titulo: 'Sem Auth',
          descricao: 'Tentativa sem token',
          categoria: 'TI',
        })
        .expect(401);
    });

    it('POST /solicitacoes - deve criar uma solicitação com sucesso para usuário autenticado', async () => {
      const response = await request(server())
        .post('/solicitacoes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Teclado com defeito',
          descricao: 'Tecla de espaço não está funcionando corretamente',
          categoria: 'TI',
        })
        .expect(201);

      const criada = response.body as SolicitacaoBody;
      expect(criada).toHaveProperty('id');
      expect(criada.titulo).toBe('Teclado com defeito');
      expect(criada.status).toBe('Aberto');
      expect(typeof criada.codigo).toBe('number');
      solicitacaoId = criada.id;
      solicitacaoCodigo = criada.codigo;
    });

    it('GET /solicitacoes - deve listar as solicitações e encontrar o item criado', async () => {
      const response = await request(server())
        .get('/solicitacoes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const listagem = response.body as ListagemBody;
      expect(Array.isArray(listagem.data)).toBe(true);

      const item = listagem.data.find((s) => s.id === solicitacaoId);
      expect(item).toBeDefined();
      expect(item?.solicitante).toBe(testUser);
    });

    it('GET /solicitacoes?search=SOL-0001 - deve encontrar a solicitação pelo código', async () => {
      const codigo = `SOL-${String(solicitacaoCodigo).padStart(4, '0')}`;
      const response = await request(server())
        .get('/solicitacoes')
        .query({ search: codigo })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const listagem = response.body as ListagemBody;
      expect(listagem.data.some((s) => s.id === solicitacaoId)).toBe(true);
    });

    it('GET /solicitacoes - deve filtrar por período e encontrar a solicitação de hoje', async () => {
      const hoje = new Date().toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
      });
      const response = await request(server())
        .get('/solicitacoes')
        .query({ data_inicio: hoje, data_fim: hoje })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const listagem = response.body as ListagemBody;
      expect(listagem.data.some((s) => s.id === solicitacaoId)).toBe(true);
    });

    it('GET /solicitacoes - não deve retornar a solicitação fora do período', async () => {
      const response = await request(server())
        .get('/solicitacoes')
        .query({ data_inicio: '2000-01-01', data_fim: '2000-01-02' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const listagem = response.body as ListagemBody;
      expect(listagem.data.some((s) => s.id === solicitacaoId)).toBe(false);
    });

    it('GET /solicitacoes - deve rejeitar período com data inicial posterior à final (400)', async () => {
      await request(server())
        .get('/solicitacoes')
        .query({ data_inicio: '2026-10-05', data_fim: '2026-10-01' })
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('PATCH /solicitacoes/:id/status - deve atualizar o status para "Em Atendimento"', async () => {
      const response = await request(server())
        .patch(`/solicitacoes/${solicitacaoId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'Em Atendimento',
        })
        .expect(200);

      expect((response.body as SolicitacaoBody).status).toBe('Em Atendimento');
    });

    it('GET /solicitacoes/dashboard - deve contabilizar a solicitação nas métricas', async () => {
      const response = await request(server())
        .get('/solicitacoes/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const metricas = response.body as {
        total: number;
        emAtendimento: number;
      };
      expect(metricas.total).toBeGreaterThanOrEqual(1);
      expect(metricas.emAtendimento).toBeGreaterThanOrEqual(1);
    });

    it('DELETE /solicitacoes/:id - deve impedir exclusão de solicitação que não está com status Aberto', async () => {
      await request(server())
        .delete(`/solicitacoes/${solicitacaoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('DELETE /solicitacoes/:id - deve permitir exclusão após retornar o status para Aberto', async () => {
      // 1. Volta o status para Aberto
      await request(server())
        .patch(`/solicitacoes/${solicitacaoId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Aberto' })
        .expect(200);

      await request(server())
        .delete(`/solicitacoes/${solicitacaoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
