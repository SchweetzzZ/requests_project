import { useEffect, useState, type FormEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Eye, EyeOff, Hexagon } from 'lucide-react';
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
    <div className="auth-layout">
      <section className="auth-form-side"><div className="auth-card"><div className="auth-card-mark"><Hexagon size={20} /></div><div className="eyebrow">BEM-VINDO AO ATENDE</div><h2>{isRegister ? 'Crie sua conta' : 'Bom ter você por aqui'}</h2><p className="auth-intro">{isRegister ? 'Comece a organizar as solicitações da sua equipe.' : 'Entre para acessar o espaço de trabalho da sua equipe.'}</p>
        <form className="auth-form" onSubmit={handleSubmit}><label>Usuário<input autoComplete="username" required minLength={3} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Seu nome de usuário" /></label><label>Senha<span className="password-wrap"><input autoComplete={isRegister ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Pelo menos 8 caracteres" /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label><button type="submit" className="button button-primary auth-submit" disabled={loading}>{loading ? 'Aguarde…' : isRegister ? 'Criar conta' : 'Entrar no espaço'}{!loading && <ArrowRight size={17} />}</button></form>
        <div className="auth-switch">{isRegister ? 'Já tem uma conta?' : 'É sua primeira vez por aqui?'} <button onClick={() => { setIsRegister(!isRegister); setPassword(''); }}>{isRegister ? 'Entrar' : 'Criar conta'}</button></div><div className="auth-assurance"><Check size={14} /> Seus pedidos ficam organizados em um só lugar.</div>
      </div><div className="auth-copyright">© 2026 Atende <span>·</span> Feito para a rotina real das equipes</div></section>
    </div>
  );
}
