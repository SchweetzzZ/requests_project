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

  const openPct = total > 0 ? Math.round((open / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const openLength = total > 0 ? (open / total) * circumference : 0;
  const inProgressLength = total > 0 ? (inProgress / total) * circumference : 0;
  const completedLength = total > 0 ? (completed / total) * circumference : 0;
  const isSingleSegment = open === total || inProgress === total || completed === total;
  const strokeCap: 'round' | 'butt' = isSingleSegment ? 'round' : 'butt';

  return (
    <div className="w-full max-w-[1600px] px-6 sm:px-8 xl:px-10 py-7 mx-auto">
      <header className="flex items-center gap-2.5 text-xs font-semibold text-muted mb-3.5 max-md:mb-3 max-md:pl-12 max-sm:text-[11px]">
        <span className="text-zinc-900 font-bold">SEU ESPAÇO</span>
        <span className="h-[3px] w-[3px] bg-zinc-400 rounded-full" />
        <span className="text-zinc-500">Central de solicitações</span>
      </header>
      <section className="flex items-end justify-between gap-6 mb-6 max-sm:items-start max-sm:flex-col max-sm:gap-4">
        <div>
          <div className="text-[11px] tracking-[1.25px] font-extrabold text-violet-800 mb-1.5 uppercase">VISÃO GERAL</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight text-ink">
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

      <section className="mt-4 max-sm:mt-2.5">
        <div className="bg-white border border-line rounded-2xl shadow-sm p-5 sm:p-6 transition-all">
          <div className="flex flex-wrap justify-between items-center gap-3 pb-5 border-b border-line/80">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-violet-100 text-violet-800 grid place-items-center shrink-0">
                <BarChart3 size={18} />
              </span>
              <div>
                <h2 className="font-display font-bold text-[17px] tracking-tight m-0 text-ink">Panorama dos pedidos</h2>
                <p className="text-muted text-[13px] font-medium mt-0.5">Distribuição do fluxo de atendimento e taxa de conclusão.</p>
              </div>
            </div>
          </div>

          {total > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 pt-5 items-stretch">
              {/* Resumo com Donut e Taxa de Conclusão */}
              <div className="lg:col-span-5 flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl bg-zinc-50/70 border border-line/80">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r={radius} fill="none" stroke="#e4e4e7" strokeWidth="7" />
                    {open > 0 && (
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="7"
                        strokeDasharray={`${openLength} ${circumference}`}
                        strokeDashoffset={0}
                        strokeLinecap={strokeCap}
                        className="transition-all duration-500"
                      />
                    )}
                    {inProgress > 0 && (
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="7"
                        strokeDasharray={`${inProgressLength} ${circumference}`}
                        strokeDashoffset={-openLength}
                        strokeLinecap={strokeCap}
                        className="transition-all duration-500"
                      />
                    )}
                    {completed > 0 && (
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="7"
                        strokeDasharray={`${completedLength} ${circumference}`}
                        strokeDashoffset={-(openLength + inProgressLength)}
                        strokeLinecap={strokeCap}
                        className="transition-all duration-500"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="font-display font-black text-xl text-ink leading-none">{total}</span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">total</span>
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Taxa de Resolução</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <strong className="font-display font-black text-3xl tracking-tight text-ink">{completedPct}%</strong>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {completed} de {total}
                    </span>
                  </div>
                  <p className="text-xs text-muted font-medium mt-1.5 leading-snug">
                    {completed === total
                      ? 'Todas as solicitações foram concluídas pela equipe.'
                      : `${open + inProgress} solicitação(ões) em andamento no momento.`}
                  </p>
                </div>
              </div>

              {/* Linhas de status individuais */}
              <div className="lg:col-span-7 flex flex-col gap-2.5 justify-center">
                {/* Abertas */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-50/70 border border-line/80 flex items-center gap-3.5 transition-all hover:bg-zinc-50">
                  <span className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 grid place-items-center shrink-0">
                    <CircleDashed size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">Abertas</span>
                        <span className="text-[11px] text-muted hidden sm:inline font-medium">· Aguardando atendimento</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-ink">{open}</span>
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded-md">
                          {openPct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${openPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Em atendimento */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-50/70 border border-line/80 flex items-center gap-3.5 transition-all hover:bg-zinc-50">
                  <span className="h-8 w-8 rounded-lg bg-sky-100 text-sky-800 grid place-items-center shrink-0">
                    <Clock3 size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">Em atendimento</span>
                        <span className="text-[11px] text-muted hidden sm:inline font-medium">· Em análise e resolução</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-ink">{inProgress}</span>
                        <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200/70 px-1.5 py-0.5 rounded-md">
                          {inProgressPct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-600 rounded-full transition-all duration-500"
                        style={{ width: `${inProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Concluídas */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-50/70 border border-line/80 flex items-center gap-3.5 transition-all hover:bg-zinc-50">
                  <span className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 grid place-items-center shrink-0">
                    <CheckCircle2 size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">Concluídas</span>
                        <span className="text-[11px] text-muted hidden sm:inline font-medium">· Finalizadas pela equipe</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-ink">{completed}</span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded-md">
                          {completedPct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${completedPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center px-3.5 pt-8 pb-3">
              <span className="h-[46px] w-[46px] rounded-xl bg-violet-100 text-violet-800 grid place-items-center mb-3">
                <TicketCheck size={24} />
              </span>
              <strong className="text-sm font-bold text-ink">Seu painel começa com um pedido</strong>
              <p className="max-w-[320px] text-muted text-[13px] font-medium leading-relaxed mt-1 mb-3">
                Assim que novas solicitações forem registradas, o panorama e a taxa de conclusão aparecem aqui.
              </p>
              <Link
                to="/solicitacoes"
                search={{ novo: true }}
                className="border-0 bg-none inline-flex items-center gap-1.5 text-violet-800 font-bold text-[13px] py-1 hover:text-violet-900 hover:underline"
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
        Solicita+ · Feito para equipes que precisam de clareza · © 2026
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
