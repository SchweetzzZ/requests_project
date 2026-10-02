import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { ClipboardList, Hexagon, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isLogin = pathname === '/login';

  async function handleLogout() {
    try {
      await logout();
      navigate({ to: '/login' });
    } catch {
      // O hook já apresenta a mensagem de erro.
    }
  }

  return (
    <div className={isLogin ? 'min-h-screen bg-white' : 'min-h-screen'}>
      {!isLogin && isAuthenticated && (
        <>
          <button
            className="fixed z-35 top-3 left-3.5 h-9 w-9.5 border border-line bg-white rounded-[9px] grid place-items-center text-zinc-900 hidden max-md:grid"
            aria-label="Abrir menu"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <Menu size={20} />
          </button>
          {mobileNavOpen && (
            <button
              className="hidden max-md:block fixed z-25 inset-0 bg-black/45 border-0"
              aria-label="Fechar menu"
              onClick={() => setMobileNavOpen(false)}
            />
          )}
          <aside
            className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-line flex flex-col py-7 px-5 z-30 max-md:translate-x-[-101%] max-md:transition-transform max-md:duration-200 max-md:ease-out max-md:shadow-xl ${mobileNavOpen ? 'max-md:translate-x-0' : ''}`}
          >
            <Link to="/" className="flex items-center gap-3 px-1.5 text-ink" onClick={() => setMobileNavOpen(false)}>
              <span className="w-[38px] h-[38px] bg-zinc-900 text-yellow-400 rounded-xl grid place-items-center">
                <Hexagon size={18} />
              </span>
              <span>
                <strong className="block font-display font-bold text-[17px] tracking-tight text-ink">Atende</strong>
                <small className="block text-muted text-xs font-medium mt-0.5">Portal interno</small>
              </span>
            </Link>
            <div className="text-[10.5px] font-bold tracking-widest text-muted mt-11 mb-3 mx-2">ESPAÇO DE TRABALHO</div>
            <nav className="grid gap-1" aria-label="Navegação principal">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{
                  className:
                    'h-11 px-3 flex items-center gap-3 rounded-[10px] text-sm font-bold bg-violet-50 text-violet-800 [&_svg]:text-violet-800',
                }}
                className="h-11 px-3 flex items-center gap-3 rounded-[10px] text-zinc-900 text-sm font-semibold transition-colors duration-150 hover:bg-zinc-100 hover:text-black"
                onClick={() => setMobileNavOpen(false)}
              >
                <LayoutDashboard size={18} />
                <span>Visão geral</span>
              </Link>
              <Link
                to="/solicitacoes"
                activeProps={{
                  className:
                    'h-11 px-3 flex items-center gap-3 rounded-[10px] text-sm font-bold bg-violet-50 text-violet-800 [&_svg]:text-violet-800',
                }}
                className="h-11 px-3 flex items-center gap-3 rounded-[10px] text-zinc-900 text-sm font-semibold transition-colors duration-150 hover:bg-zinc-100 hover:text-black"
                onClick={() => setMobileNavOpen(false)}
              >
                <ClipboardList size={18} />
                <span>Solicitações</span>
              </Link>
            </nav>
            <div className="border-t border-line pt-4.5 pb-1 px-0.5 flex items-center gap-2.5 mt-auto">
              <div className="h-9 w-9 rounded-full grid place-items-center bg-violet-100 text-violet-800 text-sm font-bold">
                {user?.name?.slice(0, 1).toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-[13px] font-bold text-ink truncate">{user?.name ?? 'Usuário'}</strong>
                <small className="block text-[11px] font-medium text-muted mt-0.5 truncate">Conta pessoal</small>
              </div>
              <button
                className="border-0 bg-transparent rounded-lg text-zinc-800 grid place-items-center h-8 w-8 transition-all duration-150 hover:bg-zinc-100 hover:text-black ml-auto"
                title="Sair"
                aria-label="Sair da conta"
                disabled={isLoggingOut}
                onClick={handleLogout}
              >
                <LogOut size={17} />
              </button>
            </div>
          </aside>
        </>
      )}
      <main
        className={
          isLogin || !isAuthenticated
            ? 'ml-64 min-h-screen max-md:ml-0 max-md:pt-9 !ml-0'
            : 'ml-64 min-h-screen max-md:ml-0 max-md:pt-9'
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
