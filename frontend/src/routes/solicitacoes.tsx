import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  ArrowDownUp,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  CircleX,
  ClipboardList,
  Clock3,
  Eye,
  FilePlus2,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  useAlterarStatus,
  useAtualizarSolicitacao,
  useCriarSolicitacao,
  useDashboard,
  useExcluirSolicitacao,
  useSolicitacao,
  useSolicitacoes,
} from '../hooks/useSolicitacoes';
import type { SolicitacaoListItem } from '../services/solicitacoes.service';
import type { components } from '../api/schema';
import { CATEGORY_STYLES, formatDate } from './index';
import { StatusDropdown } from '../components/StatusDropdown';
import { CustomSelect, type CustomSelectOption } from '../components/CustomSelect';

const formatCodigo = (codigo: number) => `SOL-${String(codigo).padStart(4, '0')}`;

type Categoria = components['schemas']['CriarSolicitacaoDto']['categoria'];
type Status = components['schemas']['AlterarStatusSolicitacaoDto']['status'];

export const Route = createFileRoute('/solicitacoes')({
  validateSearch: (search: Record<string, unknown>) =>
    search.novo === true || search.novo === 'true' ? { novo: true as const } : {},
  component: RequestsPage,
});

const CATEGORIA_FILTER_OPTIONS: CustomSelectOption<string>[] = [
  { value: '', label: 'Todas as áreas' },
  { value: 'TI', label: 'TI', dotColor: '#4338ca' },
  { value: 'RH', label: 'RH', dotColor: '#9a3412' },
  { value: 'Compras', label: 'Compras', dotColor: '#075985' },
  { value: 'Financeiro', label: 'Financeiro', dotColor: '#166534' },
  { value: 'Infraestrutura', label: 'Infraestrutura', dotColor: '#6b21a8' },
];

const STATUS_FILTER_OPTIONS: CustomSelectOption<string>[] = [
  { value: '', label: 'Todos os status' },
  { value: 'Aberto', label: 'Aberto', dotColor: '#d97706' },
  { value: 'Em Atendimento', label: 'Em Atendimento', dotColor: '#0284c7' },
  { value: 'Concluído', label: 'Concluído', dotColor: '#16a34a' },
];

const FORM_CATEGORIA_OPTIONS: CustomSelectOption<Categoria>[] = [
  { value: 'TI', label: 'TI', dotColor: '#4338ca' },
  { value: 'RH', label: 'RH', dotColor: '#9a3412' },
  { value: 'Compras', label: 'Compras', dotColor: '#075985' },
  { value: 'Financeiro', label: 'Financeiro', dotColor: '#166534' },
  { value: 'Infraestrutura', label: 'Infraestrutura', dotColor: '#6b21a8' },
];

const CATEGORY_DOTS: Record<string, string> = {
  TI: '#4338ca',
  RH: '#ea580c',
  Compras: '#0284c7',
  Financeiro: '#166534',
  Infraestrutura: '#9333ea',
};

function RequestsPage() {
  const { isAuthenticated, isLoadingUser, user } = useAuth();
  const navigate = useNavigate();
  const { novo } = Route.useSearch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SolicitacaoListItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formCategory, setFormCategory] = useState<Categoria>('TI');
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard();

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const { data, isLoading, isError } = useSolicitacoes({
    page,
    limit: 10,
    search: search.trim() || undefined,
    categoria: (category || undefined) as Categoria | undefined,
    status: (status || undefined) as Status | undefined,
    data_inicio: dateFrom || undefined,
    data_fim: dateTo || undefined,
  });

  const { data: detail, isLoading: isLoadingDetail, isError: isDetailError } = useSolicitacao(detailId);
  const createRequest = useCriarSolicitacao();
  const updateRequest = useAtualizarSolicitacao();
  const updateStatus = useAlterarStatus();
  const deleteRequest = useExcluirSolicitacao();

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) navigate({ to: '/login' });
  }, [isAuthenticated, isLoadingUser, navigate]);

  useEffect(() => {
    if (novo) {
      const timer = setTimeout(() => {
        setEditing(null);
        setTitle('');
        setDescription('');
        setFormCategory('TI');
        setFormErrors({});
        setModalOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [novo]);

  function openCreate() {
    setEditing(null);
    setTitle('');
    setDescription('');
    setFormCategory('TI');
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(item: SolicitacaoListItem) {
    setEditing(item);
    setTitle(item.titulo);
    setDescription(item.descricao);
    setFormCategory(item.categoria);
    setFormErrors({});
    setModalOpen(true);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const errors: { title?: string; description?: string } = {};

    if (!trimmedTitle) {
      errors.title = 'Por favor, informe o título da solicitação.';
    } else if (trimmedTitle.length < 3) {
      errors.title = 'O título deve ter no mínimo 3 caracteres.';
    }

    if (!trimmedDesc) {
      errors.description = 'Por favor, descreva o que precisa ser feito.';
    } else if (trimmedDesc.length < 3) {
      errors.description = 'A descrição deve ter no mínimo 3 caracteres.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editing) {
        await updateRequest.mutateAsync({
          id: editing.id,
          data: { titulo: trimmedTitle, descricao: trimmedDesc, categoria: formCategory },
        });
      } else {
        await createRequest.mutateAsync({
          titulo: trimmedTitle,
          descricao: trimmedDesc,
          categoria: formCategory,
        });
      }
      setModalOpen(false);
    } catch {
      // O hook já exibe notificação
    }
  }

  // Ao escolher a data inicial, a final acompanha (filtra um único dia) e pode ser ampliada depois.
  function handleDateFromChange(value: string) {
    setDateFrom(value);
    if (value && (!dateTo || dateTo < value)) setDateTo(value);
    setPage(1);
  }

  function handleDateToChange(value: string) {
    setDateTo(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  if (isLoadingUser || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center gap-2.5 text-ink text-[13px] font-semibold">
        <span className="h-2 w-2 bg-accent rounded-full animate-pulse-dot" />Preparando seu espaço…
      </div>
    );
  }

  const rows = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isSaving = createRequest.isPending || updateRequest.isPending;

  return (
    <div className="w-full max-w-[1600px] px-6 sm:px-8 xl:px-10 py-7 mx-auto">
      <header className="flex items-center gap-2.5 text-xs font-semibold text-muted mb-3.5 max-md:mb-3 max-md:pl-12 max-sm:text-[11px]">
        <Link to="/" className="text-zinc-900 font-bold hover:text-violet-800 transition-colors">Seu espaço</Link>
        <span className="h-[3px] w-[3px] bg-zinc-400 rounded-full" />
        <span className="text-zinc-500">Solicitações</span>
      </header>

      <section className="flex items-center justify-between gap-6 mb-6 max-sm:items-start max-sm:flex-col max-sm:gap-4">
        <div>
          <div className="text-[11px] tracking-[1.25px] font-extrabold text-violet-800 mb-1.5 uppercase">GESTÃO DO DIA A DIA</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight text-ink">Solicitações</h1>
          <p className="text-sm text-zinc-600 font-medium mt-1">Organize pedidos, filtre por área e acompanhe cada etapa com clareza.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 rounded-xl text-[13px] font-semibold whitespace-nowrap bg-zinc-900 !text-white border border-zinc-900 shadow-sm hover:bg-zinc-800 hover:-translate-y-px transition-all cursor-pointer shrink-0"
          onClick={openCreate}
        >
          <Plus size={16} className="!text-white shrink-0" />
          <span className="!text-white">Nova solicitação</span>
        </button>
      </section>

      {/* Cards de Métricas e Filtros Rápidos */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6" aria-label="Resumo e filtros rápidos">
        <button
          type="button"
          onClick={() => {
            setStatus('');
            setPage(1);
          }}
          className={`text-left p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
            status === ''
              ? 'bg-white border-violet-600 shadow-sm ring-2 ring-violet-600/15'
              : 'bg-white border-line shadow-2xs hover:border-zinc-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-900 text-xs font-semibold">
            <span>Total de solicitações</span>
            <span className="h-8 w-8 rounded-lg grid place-items-center bg-zinc-100 text-zinc-700">
              <Layers size={16} />
            </span>
          </div>
          <strong className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight block mt-2 text-ink">
            {isLoadingDashboard ? '—' : (dashboard?.total ?? 0)}
          </strong>
          <span className="text-[11.5px] text-muted font-medium block mt-0.5">Todas as etapas registradas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus(status === 'Aberto' ? '' : 'Aberto');
            setPage(1);
          }}
          className={`text-left p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
            status === 'Aberto'
              ? 'bg-amber-50/50 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-white border-line shadow-2xs hover:border-zinc-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-900 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Abertas
            </span>
            <span className="h-8 w-8 rounded-lg grid place-items-center bg-amber-100 text-amber-800">
              <CircleDashed size={16} />
            </span>
          </div>
          <strong className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight block mt-2 text-ink">
            {isLoadingDashboard ? '—' : (dashboard?.abertas ?? 0)}
          </strong>
          <span className="text-[11.5px] text-muted font-medium block mt-0.5">Aguardando atendimento</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus(status === 'Em Atendimento' ? '' : 'Em Atendimento');
            setPage(1);
          }}
          className={`text-left p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
            status === 'Em Atendimento'
              ? 'bg-sky-50/50 border-sky-500 shadow-sm ring-2 ring-sky-500/20'
              : 'bg-white border-line shadow-2xs hover:border-zinc-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-900 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Em atendimento
            </span>
            <span className="h-8 w-8 rounded-lg grid place-items-center bg-sky-100 text-sky-800">
              <Clock3 size={16} />
            </span>
          </div>
          <strong className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight block mt-2 text-ink">
            {isLoadingDashboard ? '—' : (dashboard?.emAtendimento ?? 0)}
          </strong>
          <span className="text-[11.5px] text-muted font-medium block mt-0.5">Sendo acompanhadas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus(status === 'Concluído' ? '' : 'Concluído');
            setPage(1);
          }}
          className={`text-left p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
            status === 'Concluído'
              ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-line shadow-2xs hover:border-zinc-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-900 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Concluídas
            </span>
            <span className="h-8 w-8 rounded-lg grid place-items-center bg-emerald-100 text-emerald-800">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <strong className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight block mt-2 text-ink">
            {isLoadingDashboard ? '—' : (dashboard?.concluidas ?? 0)}
          </strong>
          <span className="text-[11.5px] text-muted font-medium block mt-0.5">Finalizadas com sucesso</span>
        </button>
      </section>

      <section className="bg-white border border-line rounded-2xl shadow-sm p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-line flex-wrap max-sm:p-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[280px] max-sm:flex-wrap">
            <label className="h-9.5 flex items-center gap-2 flex-1 min-w-44 max-w-md border border-zinc-200 rounded-lg px-3 text-zinc-600 bg-white shadow-2xs transition-all focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-600/15 max-sm:basis-full max-sm:max-w-none">
              <Search size={15} className="shrink-0 text-zinc-400" />
              <input
                ref={searchInputRef}
                className="min-w-0 flex-1 border-0 outline-none text-ink text-[12.5px] font-medium bg-transparent placeholder:text-zinc-400"
                aria-label="Buscar solicitações"
                placeholder="Buscar por título ou código (ex.: SOL-0001)…"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <CustomSelect
              variant="toolbar"
              value={category}
              onChange={(val) => {
                setCategory(val);
                setPage(1);
              }}
              options={CATEGORIA_FILTER_OPTIONS}
              leadingIcon={<SlidersHorizontal size={14} />}
              placeholder="Todas as áreas"
              ariaLabel="Filtrar por categoria"
            />

            <CustomSelect
              variant="toolbar"
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              options={STATUS_FILTER_OPTIONS}
              placeholder="Todos os status"
              ariaLabel="Filtrar por status"
            />

            <div className="flex items-center gap-1.5 max-sm:basis-full">
              <span className="text-xs font-semibold text-muted">De</span>
              <input
                type="date"
                className="h-9.5 border border-zinc-200 rounded-lg px-3 text-ink bg-white shadow-2xs text-[12.5px] font-medium outline-none transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15 max-sm:flex-1 max-sm:min-w-0"
                aria-label="Data inicial"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => handleDateFromChange(event.target.value)}
              />
              <span className="text-xs font-semibold text-muted">até</span>
              <input
                type="date"
                className="h-9.5 border border-zinc-200 rounded-lg px-3 text-ink bg-white shadow-2xs text-[12.5px] font-medium outline-none transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15 max-sm:flex-1 max-sm:min-w-0"
                aria-label="Data final"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => handleDateToChange(event.target.value)}
              />
            </div>

            {(search || category || status || dateFrom || dateTo) && (
              <button
                className="flex items-center gap-1.5 border-0 bg-violet-50 text-violet-800 text-xs font-bold whitespace-nowrap py-1.5 px-2.5 rounded-lg transition-colors hover:bg-violet-100 hover:text-violet-900 cursor-pointer"
                onClick={clearFilters}
              >
                <CircleX size={14} /> Limpar filtros
              </button>
            )}
          </div>

          <div className="text-xs font-medium text-muted hidden sm:block">
            Total listado: <strong className="text-ink font-bold">{data?.total ?? 0}</strong>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr>
                <th className="h-10 bg-zinc-50 text-zinc-700 text-[11.5px] uppercase tracking-wider font-bold px-4 border-b border-line first:pl-6 w-[110px]">Código</th>
                <th className="h-10 bg-zinc-50 text-zinc-700 text-[11.5px] uppercase tracking-wider font-bold px-4 border-b border-line">Solicitação</th>
                <th className="h-10 bg-zinc-50 text-zinc-700 text-[11.5px] uppercase tracking-wider font-bold px-4 border-b border-line w-[140px]">Área</th>
                <th className="h-10 bg-zinc-50 text-zinc-700 text-[11.5px] uppercase tracking-wider font-bold px-4 border-b border-line w-[160px]">Solicitante</th>
                <th className="h-10 bg-zinc-50 text-zinc-700 text-[11.5px] uppercase tracking-wider font-bold px-4 border-b border-line w-[140px]">Data</th>
                <th className="h-10 bg-zinc-50 text-zinc-700 text-[11.5px] uppercase tracking-wider font-bold px-4 border-b border-line w-[160px]">Status</th>
                <th className="h-10 bg-zinc-50 text-zinc-700 text-[11.5px] uppercase tracking-wider font-bold px-4 border-b border-line last:pr-6 last:w-[120px] text-right">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="last:[&_td]:border-b-0 divide-y divide-line">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="h-[120px] py-4 px-4 text-center text-[13px] font-medium text-zinc-600">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-violet-700" />
                      Carregando solicitações…
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="h-[120px] py-4 px-4 text-center text-[13px] font-medium text-red-700">
                    Não foi possível carregar as solicitações. Tente novamente em instantes.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 px-6">
                    <div className="max-w-md mx-auto flex flex-col justify-center items-center text-center">
                      <span className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-800 grid place-items-center mb-3.5 shadow-2xs">
                        <ClipboardList size={24} />
                      </span>
                      <strong className="font-display font-bold text-[16px] text-ink">
                        {search || category || status || dateFrom || dateTo ? 'Nenhum pedido encontrado' : 'Nenhuma solicitação por aqui ainda'}
                      </strong>
                      <p className="text-[13px] text-muted font-medium mt-1.5 mb-4 leading-relaxed">
                        {search || category || status || dateFrom || dateTo
                          ? 'Ajuste ou limpe os filtros de busca para visualizar os registros cadastrados.'
                          : 'Crie sua primeira solicitação para começar a organizar pedidos e acompanhar o progresso de cada etapa.'}
                      </p>
                      {search || category || status || dateFrom || dateTo ? (
                        <button
                          className="border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 inline-flex items-center gap-2 text-[12.5px] font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer"
                          onClick={clearFilters}
                        >
                          <CircleX size={15} /> Limpar filtros
                        </button>
                      ) : (
                        <button
                          className="border-0 bg-zinc-900 hover:bg-zinc-800 text-white inline-flex items-center gap-2 text-[12.5px] font-semibold py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
                          onClick={openCreate}
                        >
                          <Plus size={15} /> Criar solicitação
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((item) => {
                  const isOwner = item.usuario_id === user?.userId;
                  const canEdit = isOwner && item.status === 'Aberto';
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 first:pl-6 w-[110px]">
                        <span className="font-mono text-[12px] font-semibold text-zinc-700 whitespace-nowrap">{formatCodigo(item.codigo)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-9 h-9 shrink-0 rounded-xl grid place-items-center bg-violet-100 text-violet-800 max-sm:h-8 max-sm:w-8 ${CATEGORY_STYLES[item.categoria.toLowerCase()] ?? ''}`}
                          >
                            <ClipboardList size={16} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <strong className="block text-[13.5px] font-bold text-ink truncate max-w-md xl:max-w-xl">{item.titulo}</strong>
                            <p className="text-[12px] text-zinc-500 font-medium mt-0.5 truncate max-w-md xl:max-w-xl">
                              {item.descricao}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 w-[140px]">
                        <div className="flex items-center gap-1.5 text-zinc-900 text-[12px] font-medium whitespace-nowrap">
                          <span
                            className="h-2 w-2 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: CATEGORY_DOTS[item.categoria] ?? '#71717a' }}
                          />
                          <span>{item.categoria}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 w-[160px]">
                        <span className="text-[12.5px] text-zinc-900 font-medium whitespace-nowrap">{item.solicitante ?? '—'}</span>
                      </td>
                      <td className="py-3 px-4 w-[140px]">
                        <span className="text-[12.5px] text-zinc-600 font-medium whitespace-nowrap">{formatDate(item.data_criacao)}</span>
                      </td>
                      <td className="py-3 px-4 w-[160px]">
                        <StatusDropdown
                          status={item.status}
                          disabled={updateStatus.isPending && updateStatus.variables?.id === item.id}
                          onChange={(newStatus) => updateStatus.mutate({ id: item.id, status: newStatus })}
                        />
                      </td>
                      <td className="py-3 px-4 last:pr-6 last:w-[120px] text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="border-0 bg-transparent rounded-lg text-zinc-700 grid place-items-center h-[30px] w-[30px] transition-colors hover:bg-zinc-100 hover:text-black cursor-pointer"
                            title="Ver detalhes"
                            aria-label={`Ver detalhes de ${formatCodigo(item.codigo)}`}
                            onClick={() => setDetailId(item.id)}
                          >
                            <Eye size={15} />
                          </button>
                          {canEdit && (
                            <button
                              className="border-0 bg-transparent rounded-lg text-zinc-700 grid place-items-center h-[30px] w-[30px] transition-colors hover:bg-zinc-100 hover:text-black cursor-pointer"
                              title="Editar solicitação"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              className="border-0 bg-transparent rounded-lg text-zinc-700 grid place-items-center h-[30px] w-[30px] transition-colors hover:!bg-red-50 hover:!text-red-700 cursor-pointer"
                              title="Excluir solicitação"
                              onClick={() => {
                                if (window.confirm(`Excluir “${item.titulo}”?`)) {
                                  deleteRequest.mutate(item.id);
                                }
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="min-h-[56px] px-6 border-t border-line flex items-center justify-between text-zinc-700 text-xs font-semibold max-sm:px-4 max-sm:text-[11px] bg-zinc-50/50">
          <span>
            Exibindo <strong className="text-ink font-bold">{rows.length}</strong> de <strong className="text-ink font-bold">{data?.total ?? 0}</strong> {(data?.total ?? 0) === 1 ? 'solicitação' : 'solicitações'}
          </span>
          <div className="flex items-center gap-2 max-sm:gap-1.5">
            <span className="mr-2 text-muted max-sm:mr-1">
              Página <strong className="text-ink font-bold">{page}</strong> de <strong className="text-ink font-bold">{totalPages}</strong>
            </span>
            <button
              className="h-8 w-8 grid place-items-center border border-zinc-200 rounded-lg bg-white text-ink font-semibold hover:enabled:bg-zinc-100 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
              aria-label="Página anterior"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="h-8 w-8 grid place-items-center border border-zinc-200 rounded-lg bg-white text-ink font-semibold hover:enabled:bg-zinc-100 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
              aria-label="Próxima página"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-1.5 mt-3 px-1 text-muted text-xs font-medium">
        <ArrowDownUp size={14} className="text-zinc-400" /> Os pedidos mais recentes aparecem primeiro.
      </div>

      {detailId && (
        <div
          className="fixed z-80 inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-5 animate-fade"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailId(null);
          }}
        >
          <div
            className="w-[min(520px,100%)] max-h-[calc(100vh-40px)] overflow-y-auto bg-white border border-black/10 rounded-[20px] shadow-2xl animate-modal max-sm:rounded-[14px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
          >
            <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3 max-sm:px-4">
              <div className="min-w-0">
                <span className="font-mono text-[12px] font-semibold text-zinc-500">
                  {detail ? formatCodigo(detail.codigo) : 'Detalhes'}
                </span>
                <h2 id="detail-modal-title" className="font-display font-bold text-[20px] tracking-tight m-0 text-ink break-words">
                  {detail?.titulo ?? 'Detalhes da solicitação'}
                </h2>
              </div>
              <button
                className="border-0 bg-transparent rounded-lg text-zinc-600 grid place-items-center h-8 w-8 hover:bg-zinc-100 cursor-pointer shrink-0"
                aria-label="Fechar"
                onClick={() => setDetailId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 max-sm:px-4">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center gap-2 py-10 text-[13px] font-medium text-zinc-600">
                  <Loader2 size={16} className="animate-spin text-violet-700" />
                  Carregando detalhes…
                </div>
              ) : isDetailError || !detail ? (
                <p className="py-10 text-center text-[13px] font-medium text-red-700">
                  Não foi possível carregar os detalhes desta solicitação.
                </p>
              ) : (
                <>
                  <p className="text-[13.5px] text-zinc-800 leading-relaxed whitespace-pre-wrap break-words m-0 mb-5">
                    {detail.descricao}
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 m-0 text-[12.5px] max-sm:grid-cols-1">
                    <div>
                      <dt className="text-muted font-semibold">Categoria</dt>
                      <dd className="m-0 text-ink font-medium">{detail.categoria}</dd>
                    </div>
                    <div>
                      <dt className="text-muted font-semibold">Status</dt>
                      <dd className="m-0 text-ink font-medium">{detail.status}</dd>
                    </div>
                    <div>
                      <dt className="text-muted font-semibold">Solicitante</dt>
                      <dd className="m-0 text-ink font-medium">{detail.solicitante ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted font-semibold">Data de abertura</dt>
                      <dd className="m-0 text-ink font-medium">{new Date(detail.data_criacao).toLocaleString('pt-BR')}</dd>
                    </div>
                  </dl>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed z-80 inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-5 animate-fade"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <section
            className="w-[min(520px,100%)] max-h-[calc(100vh-40px)] overflow-y-auto bg-white border border-black/10 rounded-[20px] shadow-2xl animate-modal max-sm:rounded-[14px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-modal-title"
          >
            <header className="relative px-7 pt-6 pb-4.5 border-b border-line max-sm:px-5 max-sm:pt-5 max-sm:pb-4">
              <span className="h-[38px] w-[38px] grid place-items-center text-violet-800 bg-violet-100 rounded-xl mb-3">
                <FilePlus2 size={19} />
              </span>
              <button
                className="border-0 bg-transparent rounded-lg text-zinc-800 grid place-items-center h-8 w-8 transition-all duration-150 hover:bg-zinc-100 hover:text-black absolute right-5 top-5"
                aria-label="Fechar"
                onClick={() => setModalOpen(false)}
              >
                <X size={19} />
              </button>
              <h2 id="request-modal-title" className="font-display font-bold text-[20px] tracking-tight m-0 text-ink">
                {editing ? 'Editar solicitação' : 'Nova solicitação'}
              </h2>
            </header>

            <form onSubmit={submitForm} noValidate className="flex flex-col gap-4.5 px-7 pt-5.5 pb-6.5 max-sm:px-5 max-sm:pt-4 max-sm:pb-5">
              <div className="flex flex-col gap-[7px] relative">
                <div className="flex items-center justify-between">
                  <label htmlFor="form-title" className="inline-flex items-center gap-1 text-[13px] font-bold text-ink">
                    Título <span className="text-red-600 font-bold text-[13px]">*</span>
                  </label>
                </div>
                <input
                  id="form-title"
                  autoFocus
                  maxLength={255}
                  placeholder="Ex.: Acesso ao sistema financeiro"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (formErrors.title) {
                      setFormErrors((prev) => ({ ...prev, title: undefined }));
                    }
                  }}
                  className={`w-full border border-zinc-300 rounded-[10px] py-[11px] px-3.5 text-ink outline-none bg-white text-[13.5px] font-medium transition-all hover:border-zinc-400 focus:border-violet-600 focus:ring-3 focus:ring-violet-600/15 placeholder:text-zinc-600 ${formErrors.title ? '!border-red-600 !ring-3 !ring-red-600/15' : ''}`}
                />
                {formErrors.title && (
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] text-red-600 font-semibold mt-0.5">
                    <AlertCircle size={13} /> {formErrors.title}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-[7px] relative">
                <div className="flex items-center justify-between">
                  <label htmlFor="form-desc" className="inline-flex items-center gap-1 text-[13px] font-bold text-ink">
                    Descrição <span className="text-red-600 font-bold text-[13px]">*</span>
                  </label>
                  <span className="text-[11px] text-muted tabular-nums font-semibold">
                    <span className={description.length >= 240 ? '!text-amber-700 !font-bold' : ''}>
                      {description.length}
                    </span>
                    /255
                  </span>
                </div>
                <textarea
                  id="form-desc"
                  rows={4}
                  maxLength={255}
                  placeholder="Descreva o contexto e o que precisa ser feito…"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    if (formErrors.description) {
                      setFormErrors((prev) => ({ ...prev, description: undefined }));
                    }
                  }}
                  className={`w-full border border-zinc-300 rounded-[10px] py-[11px] px-3.5 text-ink outline-none bg-white text-[13.5px] font-medium transition-all hover:border-zinc-400 focus:border-violet-600 focus:ring-3 focus:ring-violet-600/15 placeholder:text-zinc-600 resize-y min-h-[98px] leading-relaxed ${formErrors.description ? '!border-red-600 !ring-3 !ring-red-600/15' : ''}`}
                />
                {formErrors.description && (
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] text-red-600 font-semibold mt-0.5">
                    <AlertCircle size={13} /> {formErrors.description}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-[7px] relative">
                <div className="flex items-center justify-between">
                  <label id="form-category-label" className="inline-flex items-center gap-1 text-[13px] font-bold text-ink">
                    Área responsável <span className="text-red-600 font-bold text-[13px]">*</span>
                  </label>
                </div>
                <CustomSelect
                  variant="form"
                  value={formCategory}
                  onChange={(val) => setFormCategory(val as Categoria)}
                  options={FORM_CATEGORIA_OPTIONS}
                  ariaLabel="Selecione a área responsável"
                />
              </div>

              <footer className="flex justify-end gap-2.5 pt-1.5 max-sm:flex-wrap">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap bg-white border border-zinc-300 text-ink hover:border-zinc-400 hover:bg-zinc-100 hover:-translate-y-px transition-all max-sm:flex-1"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap bg-ink !text-white border border-ink shadow-sm hover:bg-zinc-800 hover:-translate-y-px transition-all max-sm:flex-1 cursor-pointer"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin !text-white" />
                      <span className="!text-white">Salvando…</span>
                    </>
                  ) : (
                    <>
                      <span className="!text-white">{editing ? 'Salvar alterações' : 'Criar solicitação'}</span>
                      <ArrowRight size={16} className="!text-white" />
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
