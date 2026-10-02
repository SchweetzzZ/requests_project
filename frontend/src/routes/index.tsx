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

  if (isLoadingUser || !isAuthenticated)
    return (
      <div className="h-screen flex items-center justify-center gap-2.5 text-ink text-[13px] font-semibold">
        <span className="h-2 w-2 bg-accent rounded-full animate-pulse-dot" />
        Preparando seu espaço…
      </div>
    );

  const total = dashboard?.total ?? 0;
  const open = dashboard?.abertas ?? 0;
  const inProgress = dashboard?.emAtendimento ?? 0;
  const completed = dashboard?.concluidas ?? 0;

  return (
    <div className="w-[min(1120px,calc(100%-76px))] mx-auto py-8 max-md:w-[calc(100%-40px)] max-sm:w-[calc(100%-30px)] max-sm:pt-4.5">
      <header className="flex items-center gap-2.5 text-xs font-semibold text-muted mb-11 max-md:mb-7.5 max-md:pl-12 max-sm:mb-7 max-sm:text-[11px]">
        <span className="text-zinc-900 font-bold">SEU ESPAÇO</span>
        <span className="h-[3px] w-[3px] bg-zinc-500 rounded-full" /> Central de solicitações
      </header>
      <section className="flex items-end justify-between gap-6 mb-7.5 max-sm:items-start max-sm:flex-col max-sm:gap-4 max-sm:mb-5.5">
        <div>
          <div className="text-[11px] tracking-[1.25px] font-extrabold text-violet-800 mb-2.5">VISÃO GERAL</div>
          <h1 className="font-display font-extrabold text-4xl leading-tight tracking-tight text-ink max-sm:text-[28px]">
            Olá, {user?.name?.split(' ')[0] ?? 'bem-vindo'}
          </h1>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3.5 max-md:grid-cols-2 max-sm:gap-2.5" aria-label="Resumo das solicitações">
        <MetricCard label="Total de solicitações" value={total} detail="registradas no sistema" icon={<TicketCheck size={18} />} tone="violet" loading={isLoadingDashboard} />
        <MetricCard label="Abertas" value={open} detail="aguardando atendimento" icon={<CircleDashed size={18} />} tone="amber" loading={isLoadingDashboard} />
        <MetricCard label="Em atendimento" value={inProgress} detail="sendo acompanhadas" icon={<Clock3 size={18} />} tone="blue" loading={isLoadingDashboard} />
        <MetricCard label="Concluídas" value={completed} detail="finalizadas pela equipe" icon={<CheckCircle2 size={18} />} tone="green" loading={isLoadingDashboard} />
      </section>

      <section className="grid grid-cols-1 gap-3.5 mt-4 max-sm:gap-2.5 max-sm:mt-2.5">
        <div className="bg-white border border-line rounded-2xl shadow-sm p-5 min-h-[236px] max-md:min-h-[226px] max-sm:min-h-[210px]">
          <div className="flex justify-between items-start gap-4.5">
            <div>
              <h2 className="font-display font-bold text-[17px] tracking-tight m-0 text-ink">Panorama dos pedidos</h2>
              <p className="text-muted text-[13px] font-medium mt-1.5">Acompanhe a distribuição por etapa.</p>
            </div>
            <span className="h-8 w-8 rounded-[9px] bg-zinc-100 text-violet-800 grid place-items-center">
              <BarChart3 size={17} />
            </span>
          </div>
          {total > 0 ? (
            <>
              <div className="flex items-baseline gap-2 mt-7">
                <strong className="font-display font-extrabold text-[26px] text-ink">{total}</strong>
                <span className="text-xs text-muted font-medium">solicitações no total</span>
              </div>
              <div className="h-3 flex overflow-hidden rounded-[10px] bg-line gap-[3px] mt-3.5" role="img" aria-label={`${open} abertas, ${inProgress} em atendimento e ${completed} concluídas`}>
                <span className="block min-w-[3px] rounded-[10px] bg-amber-600" style={{ width: `${(open / total) * 100}%` }} />
                <span className="block min-w-[3px] rounded-[10px] bg-sky-600" style={{ width: `${(inProgress / total) * 100}%` }} />
                <span className="block min-w-[3px] rounded-[10px] bg-green-600" style={{ width: `${(completed / total) * 100}%` }} />
              </div>
              <div className="flex gap-6 flex-wrap mt-4.5 max-md:gap-3 max-sm:gap-2.5">
                <span className="flex items-center gap-[7px] text-zinc-900 text-xs font-semibold max-md:text-[11px]">
                  <i className="h-2 w-2 rounded-full bg-amber-600" />
                  Abertas <b className="text-ink text-xs font-extrabold ml-0.5">{open}</b>
                </span>
                <span className="flex items-center gap-[7px] text-zinc-900 text-xs font-semibold max-md:text-[11px]">
                  <i className="h-2 w-2 rounded-full bg-sky-600" />
                  Em atendimento <b className="text-ink text-xs font-extrabold ml-0.5">{inProgress}</b>
                </span>
                <span className="flex items-center gap-[7px] text-zinc-900 text-xs font-semibold max-md:text-[11px]">
                  <i className="h-2 w-2 rounded-full bg-green-600" />
                  Concluídas <b className="text-ink text-xs font-extrabold ml-0.5">{completed}</b>
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center px-3.5 pt-6 pb-1">
              <span className="h-[42px] w-[42px] rounded-xl bg-violet-100 text-violet-800 grid place-items-center mb-3">
                <TicketCheck size={22} />
              </span>
              <strong className="text-sm font-bold text-ink">Seu painel começa com um pedido</strong>
              <p className="max-w-[310px] text-muted text-[12.5px] font-medium leading-relaxed mt-1.5 mb-2.5">
                Quando as solicitações forem registradas, o panorama aparece aqui.
              </p>
              <Link
                to="/solicitacoes"
                search={{ novo: true }}
                className="border-0 bg-none inline-flex items-center gap-1.5 text-violet-800 font-bold text-[12.5px] py-1 hover:text-violet-900 hover:underline"
              >
                Criar primeira solicitação <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-line rounded-2xl shadow-sm mt-4 p-0 overflow-hidden max-sm:mt-2.5">
        <div className="flex justify-between items-center gap-4.5 p-5 border-b border-line">
          <div>
            <h2 className="font-display font-bold text-[17px] tracking-tight m-0 text-ink">Solicitações recentes</h2>
            <p className="text-muted text-[13px] font-medium mt-1.5">Os pedidos mais novos do espaço.</p>
          </div>
          <Link
            to="/solicitacoes"
            className="inline-flex items-center justify-center gap-2 min-h-9 px-3.5 rounded-[10px] text-xs font-semibold whitespace-nowrap bg-white border border-zinc-300 text-ink hover:border-zinc-400 hover:bg-zinc-100 hover:-translate-y-px transition-all"
          >
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>
        {isLoadingLatest ? (
          <div className="p-6 text-muted text-[13px] font-medium">Carregando solicitações…</div>
        ) : latest?.data.length ? (
          <div className="px-5 max-sm:px-3.5">
            {latest.data.map((item) => (
              <div
                className="flex items-center gap-3.5 min-h-[68px] border-b border-line last:border-b-0 max-sm:gap-2.5 max-sm:min-h-[62px]"
                key={item.id}
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded-[10px] grid place-items-center bg-violet-100 text-violet-800 max-sm:h-8 max-sm:w-8 ${CATEGORY_STYLES[item.categoria.toLowerCase()] ?? ''}`}
                >
                  <FileText size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-[13.5px] font-bold text-ink max-sm:text-xs">{item.titulo}</strong>
                  <span className="block truncate mt-1 text-xs text-muted font-medium max-sm:text-[11px]">
                    {item.categoria} <i className="not-italic text-zinc-500 px-[3px] font-bold">·</i> {formatDate(item.data_criacao)}
                  </span>
                </div>
                <StatusBadge status={item.status} />
                <Link
                  to="/solicitacoes"
                  className="h-[30px] w-[30px] rounded-lg text-zinc-800 grid place-items-center hover:bg-zinc-100 hover:text-black"
                  aria-label={`Ver ${item.titulo}`}
                >
                  <ArrowRight size={17} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-6 text-muted text-[13px] font-medium">
            <p>Ainda não há solicitações para mostrar.</p>
            <Link
              to="/solicitacoes"
              search={{ novo: true }}
              className="border-0 bg-none inline-flex items-center gap-1.5 text-violet-800 font-bold text-[12.5px] py-1 hover:text-violet-900 hover:underline"
            >
              Criar solicitação <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
      <footer className="text-xs text-zinc-600 font-medium text-center pt-5.5 border-t border-line mt-5">
        Atende · Feito para equipes que precisam de clareza · © 2026
      </footer>
    </div>
  );
}

const TONE_STYLES: Record<string, string> = {
  violet: 'bg-violet-100 text-violet-800',
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-sky-100 text-sky-700',
  green: 'bg-green-100 text-green-700',
};

export const CATEGORY_STYLES: Record<string, string> = {
  rh: '!bg-orange-100 !text-orange-800',
  compras: '!bg-sky-100 !text-sky-800',
  financeiro: '!bg-green-100 !text-green-800',
  infraestrutura: '!bg-purple-100 !text-purple-800',
  ti: '!bg-violet-100 !text-indigo-700',
};

function MetricCard({ label, value, detail, icon, tone, loading }: { label: string; value: number; detail: string; icon: React.ReactNode; tone: string; loading: boolean }) {
  return (
    <article className="bg-white border border-line rounded-2xl shadow-sm min-h-[148px] p-4.5 max-sm:min-h-[128px] max-sm:p-3.5">
      <div className="flex justify-between items-center gap-2 text-zinc-900 text-[13px] font-semibold max-sm:text-xs">
        <span>{label}</span>
        <span className={`h-[34px] w-[34px] rounded-[10px] grid place-items-center max-sm:h-[30px] max-sm:w-[30px] ${TONE_STYLES[tone] ?? ''}`}>
          {icon}
        </span>
      </div>
      <strong className="font-display font-extrabold text-[30px] tracking-tight block mt-3 text-ink max-sm:text-[26px] max-sm:mt-2.5">
        {loading ? '—' : value}
      </strong>
      <span className="text-xs text-muted font-medium block mt-1 max-sm:text-[11px]">{detail}</span>
    </article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusClass =
    status === 'Concluído'
      ? 'text-emerald-800 bg-emerald-50/90 border border-emerald-200/80'
      : status === 'Em Atendimento'
        ? 'text-sky-800 bg-sky-50/90 border border-sky-200/80'
        : 'text-amber-800 bg-amber-50/90 border border-amber-200/80';
  const dotColor =
    status === 'Concluído'
      ? '#16a34a'
      : status === 'Em Atendimento'
        ? '#0284c7'
        : '#d97706';
  return (
    <span className={`inline-flex items-center gap-1.5 h-[25px] px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap max-sm:text-[10px] max-sm:h-[23px] max-sm:px-2 ${statusClass}`}>
      <span className="h-1.5 w-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: dotColor }} />
      {status}
    </span>
  );
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}
