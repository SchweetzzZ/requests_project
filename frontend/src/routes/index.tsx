import { useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, BarChart3, CheckCircle2, CircleDashed, Clock3, FileText, TicketCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard, useSolicitacoes } from '../hooks/useSolicitacoes';

export const Route = createFileRoute('/')({ component: DashboardPage });

function DashboardPage() {
  const { isAuthenticated, isLoadingUser, user } = useAuth();
  const navigate = useNavigate();
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard();
  const { data: latest, isLoading: isLoadingLatest } = useSolicitacoes({ page: 1, limit: 5 });

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) navigate({ to: '/login' });
  }, [isAuthenticated, isLoadingUser, navigate]);

  if (isLoadingUser || !isAuthenticated) return <div className="page-loading"><span className="loading-dot" />Preparando seu espaço…</div>;

  const total = dashboard?.total ?? 0;
  const open = dashboard?.abertas ?? 0;
  const inProgress = dashboard?.emAtendimento ?? 0;
  const completed = dashboard?.concluidas ?? 0;

  return (
    <div className="page-shell">
      <header className="page-topline"><span>SEU ESPAÇO</span><span className="topline-dot" /> Central de solicitações</header>
      <section className="page-heading">
        <div>
          <div className="eyebrow">VISÃO GERAL</div>
          <h1>Olá, {user?.name?.split(' ')[0] ?? 'bem-vindo'}</h1>
        </div>
      </section>

      <section className="metric-grid" aria-label="Resumo das solicitações">
        <MetricCard label="Total de solicitações" value={total} detail="registradas no sistema" icon={<TicketCheck size={18} />} tone="violet" loading={isLoadingDashboard} />
        <MetricCard label="Abertas" value={open} detail="aguardando atendimento" icon={<CircleDashed size={18} />} tone="amber" loading={isLoadingDashboard} />
        <MetricCard label="Em atendimento" value={inProgress} detail="sendo acompanhadas" icon={<Clock3 size={18} />} tone="blue" loading={isLoadingDashboard} />
        <MetricCard label="Concluídas" value={completed} detail="finalizadas pela equipe" icon={<CheckCircle2 size={18} />} tone="green" loading={isLoadingDashboard} />
      </section>

      <section className="overview-grid">
        <div className="panel status-panel">
          <div className="panel-heading"><div><h2>Panorama dos pedidos</h2><p>Acompanhe a distribuição por etapa.</p></div><span className="soft-icon"><BarChart3 size={17} /></span></div>
          {total > 0 ? (
            <>
              <div className="status-total"><strong>{total}</strong><span>solicitações no total</span></div>
              <div className="status-bar" role="img" aria-label={`${open} abertas, ${inProgress} em atendimento e ${completed} concluídas`}>
                <span className="bar-open" style={{ width: `${(open / total) * 100}%` }} />
                <span className="bar-progress" style={{ width: `${(inProgress / total) * 100}%` }} />
                <span className="bar-complete" style={{ width: `${(completed / total) * 100}%` }} />
              </div>
              <div className="status-legend"><span><i className="legend-open" />Abertas <b>{open}</b></span><span><i className="legend-progress" />Em atendimento <b>{inProgress}</b></span><span><i className="legend-complete" />Concluídas <b>{completed}</b></span></div>
            </>
          ) : (
            <div className="empty-chart"><span className="empty-chart-icon"><TicketCheck size={22} /></span><strong>Seu painel começa com um pedido</strong><p>Quando as solicitações forem registradas, o panorama aparece aqui.</p><Link to="/solicitacoes" search={{ novo: true }} className="text-link">Criar primeira solicitação <ArrowRight size={15} /></Link></div>
          )}
        </div>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading recent-heading"><div><h2>Solicitações recentes</h2><p>Os pedidos mais novos do espaço.</p></div><Link to="/solicitacoes" className="button button-secondary">Ver todas <ArrowRight size={16} /></Link></div>
        {isLoadingLatest ? <div className="table-loading">Carregando solicitações…</div> : latest?.data.length ? (
          <div className="recent-list">
            {latest.data.map((item) => <div className="recent-row" key={item.id}><span className={`category-icon category-${item.categoria.toLowerCase()}`}><FileText size={16} /></span><div className="recent-title"><strong>{item.titulo}</strong><span>{item.categoria} <i>·</i> {formatDate(item.data_criacao)}</span></div><StatusBadge status={item.status} /><Link to="/solicitacoes" className="row-arrow" aria-label={`Ver ${item.titulo}`}><ArrowRight size={17} /></Link></div>)}
          </div>
        ) : <div className="empty-recent"><p>Ainda não há solicitações para mostrar.</p><Link to="/solicitacoes" search={{ novo: true }} className="text-link">Criar solicitação <ArrowRight size={15} /></Link></div>}
      </section>
      <footer className="page-footer">Atende · Feito para equipes que precisam de clareza · © 2026</footer>
    </div>
  );
}

function MetricCard({ label, value, detail, icon, tone, loading }: { label: string; value: number; detail: string; icon: React.ReactNode; tone: string; loading: boolean }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon metric-${tone}`}>{icon}</span></div><strong className="metric-value">{loading ? '—' : value}</strong><span className="metric-detail">{detail}</span></article>;
}

export function StatusBadge({ status }: { status: string }) {
  const statusClass = status === 'Concluído' ? 'status-done' : status === 'Em Atendimento' ? 'status-progress' : 'status-open';
  return <span className={`status-badge ${statusClass}`}><i />{status}</span>;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}
