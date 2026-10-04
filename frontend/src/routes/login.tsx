import { useEffect, useState, type FormEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Route = createFileRoute('/login')({ component: LoginPage });

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isLoggingIn, isRegistering, isAuthenticated, isLoadingUser } = useAuth();
  const navigate = useNavigate();
  const loading = isLoggingIn || isRegistering;

  useEffect(() => {
    if (!isLoadingUser && isAuthenticated) navigate({ to: '/' });
  }, [isAuthenticated, isLoadingUser, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (isRegister) {
        await register({ user: username.trim(), password });
        setIsRegister(false);
        setPassword('');
      } else {
        await login({ user: username.trim(), password });
        navigate({ to: '/' });
      }
    } catch { /* O hook apresenta a mensagem retornada pela API. */ }
  }

  return (
    <div className="flex justify-center min-h-screen bg-gradient-to-br from-zinc-100 to-white">
      <section className="w-full min-h-screen flex flex-col items-center justify-center px-7 py-10 relative max-sm:px-6 max-sm:py-14">
        <div className="w-full max-w-[380px]">
          <div className="text-[11px] tracking-[1.25px] font-extrabold text-violet-800 mb-2.5">BEM-VINDO AO SOLICITA+</div>
          <h2 className="font-display font-extrabold text-[28px] leading-tight tracking-tight text-ink max-sm:text-2xl">
            {isRegister ? 'Crie sua conta' : 'Bom ter você por aqui'}
          </h2>
          <p className="text-sm text-zinc-800 font-medium leading-relaxed mt-2.5 mb-7">
            {isRegister ? 'Comece a organizar as solicitações da sua equipe.' : 'Entre para acessar o espaço de trabalho da sua equipe.'}
          </p>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-[7px] text-ink text-[12.5px] font-bold relative">
              Usuário
              <input
                className="w-full border border-zinc-300 rounded-lg py-[11px] px-3 text-ink outline-none bg-white text-[13px] font-medium transition-all focus:border-violet-600 focus:ring-3 focus:ring-violet-600/15 placeholder:text-zinc-600"
                autoComplete="username"
                required
                minLength={3}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Seu nome de usuário"
              />
            </label>
            <label className="grid gap-[7px] text-ink text-[12.5px] font-bold relative">
              Senha
              <span className="relative">
                <input
                  className="w-full border border-zinc-300 rounded-lg py-[11px] px-3 pr-[42px] text-ink outline-none bg-white text-[13px] font-medium transition-all focus:border-violet-600 focus:ring-3 focus:ring-violet-600/15 placeholder:text-zinc-600"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Pelo menos 8 caracteres"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1.5 border-0 bg-transparent text-zinc-800 h-7 w-7 grid place-items-center hover:text-black"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap bg-ink text-white border border-ink shadow-sm hover:-translate-y-px transition-all w-full mt-1.5 min-h-[46px]"
              disabled={loading}
            >
              {loading ? 'Aguarde…' : isRegister ? 'Criar conta' : 'Entrar no espaço'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
          <div className="text-center text-[13px] text-zinc-800 font-medium mt-5.5">
            {isRegister ? 'Já tem uma conta?' : 'É sua primeira vez por aqui?'}{' '}
            <button
              className="border-0 bg-none text-violet-800 font-bold px-0.5 cursor-pointer hover:underline"
              onClick={() => {
                setIsRegister(!isRegister);
                setPassword('');
              }}
            >
              {isRegister ? 'Entrar' : 'Criar conta'}
            </button>
          </div>
        </div>
        <div className="absolute bottom-5.5 text-zinc-600 font-medium text-[11px] max-sm:bottom-4.5 max-sm:text-center max-sm:w-full max-sm:text-[10px]">
          © 2026 Solicita+ <span className="px-1.5 text-zinc-400">·</span> Feito para a rotina real das equipes
        </div>
      </section>
    </div>
  );
}
