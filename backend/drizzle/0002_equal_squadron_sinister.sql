CREATE TYPE "public"."categoria_solicitacao" AS ENUM('TI', 'RH', 'Compras', 'Financeiro', 'Infraestrutura');--> statement-breakpoint
CREATE TYPE "public"."status_solicitacao" AS ENUM('Aberto', 'Em Atendimento', 'Concluído');--> statement-breakpoint
CREATE TABLE "solicitacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" varchar(255) NOT NULL,
	"status" "status_solicitacao" DEFAULT 'Aberto' NOT NULL,
	"categoria" "categoria_solicitacao" NOT NULL,
	"data_criacao" timestamp DEFAULT now() NOT NULL,
	"usuario_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;