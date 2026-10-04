import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { users } from '../auth/schema/schema';

// Mesmas regras de validação do cadastro (auth.dto.ts).
const MIN_NOME = 3;
const MIN_SENHA = 8;

/**
 * Cria os usuários de demonstração definidos no ambiente:
 *   DEMO_USERS=usuario1,usuario2   (nomes separados por vírgula)
 *   DEMO_PASSWORD=Senha123!        (mesma senha para todos)
 *
 * Se as variáveis não forem informadas, apenas registra um aviso e segue.
 * É idempotente: usuário já cadastrado é ignorado, sem alterar a senha.
 */
export async function runSeed() {
  const nomes = [
    ...new Set(
      (process.env.DEMO_USERS ?? '')
        .split(',')
        .map((nome) => nome.trim())
        .filter(Boolean),
    ),
  ];
  const senha = process.env.DEMO_PASSWORD ?? '';

  if (nomes.length === 0 || !senha) {
    console.log(
      '[Seed] DEMO_USERS/DEMO_PASSWORD não informados; usuários de demonstração não criados.',
    );
    return;
  }

  if (senha.length < MIN_SENHA) {
    console.log(
      `[Seed] DEMO_PASSWORD deve ter pelo menos ${MIN_SENHA} caracteres; usuários de demonstração não criados.`,
    );
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);
  let hash: string | undefined;

  try {
    for (const name of nomes) {
      if (name.length < MIN_NOME) {
        console.log(
          `[Seed] Nome "${name}" ignorado: mínimo de ${MIN_NOME} caracteres.`,
        );
        continue;
      }

      const [existente] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.name, name));

      if (existente) {
        console.log(`[Seed] Usuário de demonstração já existe: ${name}`);
        continue;
      }

      hash ??= await bcrypt.hash(senha, 12);
      await db
        .insert(users)
        .values({ name, password: hash })
        .onConflictDoNothing({ target: users.name });

      console.log(`[Seed] Usuário de demonstração criado: ${name}`);
    }
  } finally {
    await pool.end();
  }
}
