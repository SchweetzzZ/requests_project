import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from '../src/app.module';
import { runMigrations } from '../src/modules/db/migrate';

describe('Fluxo de Solicitações e Auth (Teste de Integração)', () => {
    let app: INestApplication;
    let token: string;
    let solicitacaoId: string;

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
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    user: testUser,
                    password: testPassword,
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(testUser);
        });

        it('POST /auth/login - deve autenticar e retornar access_token', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    user: testUser,
                    password: testPassword,
                })
                .expect(200);

            expect(response.body).toHaveProperty('access_token');
            token = response.body.access_token;
        });
    });

    describe('2. Solicitações & Regras de Negócio', () => {
        it('POST /solicitacoes - deve bloquear criação se o usuário não estiver autenticado (401)', async () => {
            await request(app.getHttpServer())
                .post('/solicitacoes')
                .send({
                    titulo: 'Sem Auth',
                    descricao: 'Tentativa sem token',
                    categoria: 'TI',
                })
                .expect(401);
        });

        it('POST /solicitacoes - deve criar uma solicitação com sucesso para usuário autenticado', async () => {
            const response = await request(app.getHttpServer())
                .post('/solicitacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    titulo: 'Teclado com defeito',
                    descricao: 'Tecla de espaço não está funcionando corretamente',
                    categoria: 'TI',
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.titulo).toBe('Teclado com defeito');
            expect(response.body.status).toBe('Aberto');
            solicitacaoId = response.body.id;
        });

        it('GET /solicitacoes - deve listar as solicitações e encontrar o item criado', async () => {
            const response = await request(app.getHttpServer())
                .get('/solicitacoes')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);

            const item = response.body.data.find((s: any) => s.id === solicitacaoId);
            expect(item).toBeDefined();
            expect(item.solicitante).toBe(testUser);
        });

        it('PATCH /solicitacoes/:id/status - deve atualizar o status para "Em Atendimento"', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/solicitacoes/${solicitacaoId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    status: 'Em Atendimento',
                })
                .expect(200);

            expect(response.body.status).toBe('Em Atendimento');
        });

        it('GET /solicitacoes/dashboard - deve contabilizar a solicitação nas métricas', async () => {
            const response = await request(app.getHttpServer())
                .get('/solicitacoes/dashboard')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.total).toBeGreaterThanOrEqual(1);
            expect(response.body.emAtendimento).toBeGreaterThanOrEqual(1);
        });

        it('DELETE /solicitacoes/:id - deve impedir exclusão de solicitação que não está com status Aberto', async () => {
            await request(app.getHttpServer())
                .delete(`/solicitacoes/${solicitacaoId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('DELETE /solicitacoes/:id - deve permitir exclusão após retornar o status para Aberto', async () => {
            // 1. Volta o status para Aberto
            await request(app.getHttpServer())
                .patch(`/solicitacoes/${solicitacaoId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'Aberto' })
                .expect(200);

            await request(app.getHttpServer())
                .delete(`/solicitacoes/${solicitacaoId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });
    });
});
