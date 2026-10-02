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
    <div className={isLogin ? 'app-frame login-frame' : 'app-frame'}>
      {!isLogin && isAuthenticated && (
        <>
          <button
            className="mobile-menu-button"
            aria-label="Abrir menu"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <Menu size={20} />
          </button>
          {mobileNavOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}
          <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
            <Link to="/" className="brand-lockup" onClick={() => setMobileNavOpen(false)}>
              <span className="brand-mark"><Hexagon size={18} /></span>
              <span><strong>Atende</strong><small>Portal interno</small></span>
            </Link>
            <div className="nav-caption">ESPAÇO DE TRABALHO</div>
            <nav className="side-nav" aria-label="Navegação principal">
              <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'nav-link nav-link-active' }} className="nav-link" onClick={() => setMobileNavOpen(false)}>
                <LayoutDashboard size={18} /><span>Visão geral</span>
              </Link>
              <Link to="/solicitacoes" activeProps={{ className: 'nav-link nav-link-active' }} className="nav-link" onClick={() => setMobileNavOpen(false)}>
                <ClipboardList size={18} /><span>Solicitações</span>
              </Link>
            </nav>
            <div className="profile-row" style={{ marginTop: 'auto' }}>
              <div className="avatar">{user?.name?.slice(0, 1).toUpperCase() ?? 'U'}</div>
              <div className="profile-copy"><strong>{user?.name ?? 'Usuário'}</strong><small>Conta pessoal</small></div>
              <button className="icon-button logout-button" title="Sair" aria-label="Sair da conta" disabled={isLoggingOut} onClick={handleLogout}><LogOut size={17} /></button>
            </div>
          </aside>
        </>
      )}
      <main className={isLogin || !isAuthenticated ? 'main-content main-content-full' : 'main-content'}>
        <Outlet />
      </main>
    </div>
  );
}
