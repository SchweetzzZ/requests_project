import { pgEnum, pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "../../auth/schema/schema";

export const categoriaSolicitacaoEnum = pgEnum('categoria_solicitacao', [
    'TI',
    'RH',
    'Compras',
    'Financeiro',
    'Infraestrutura',
]);

export const statusSolicitacaoEnum = pgEnum('status_solicitacao', [
    'Aberto',
    'Em Atendimento',
    'Concluído',
]);

export const solicitacoes = pgTable('solicitacoes', {
    id: uuid('id').primaryKey().defaultRandom(),
    titulo: varchar('titulo', { length: 255 }).notNull(),
    descricao: varchar('descricao', { length: 255 }).notNull(),
    status: statusSolicitacaoEnum('status').notNull().default('Aberto'),
    categoria: categoriaSolicitacaoEnum('categoria').notNull(),
    data_criacao: timestamp('data_criacao').notNull().defaultNow(),
    usuario_id: uuid('usuario_id').notNull().references(() => users.id),
});
