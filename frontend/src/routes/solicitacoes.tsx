import { useEffect, useState, type FormEvent } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  ArrowDownUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleX,
  ClipboardList,
  FilePlus2,
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
  useExcluirSolicitacao,
  useSolicitacoes,
} from '../hooks/useSolicitacoes';
import type { SolicitacaoListItem } from '../services/solicitacoes.service';
import type { components } from '../api/schema';
import { CATEGORY_STYLES, formatDate } from './index';
import { StatusDropdown } from '../components/StatusDropdown';
import { CustomSelect, type CustomSelectOption } from '../components/CustomSelect';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SolicitacaoListItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formCategory, setFormCategory] = useState<Categoria>('TI');
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({});

  const { data, isLoading, isError } = useSolicitacoes({
    page,
    limit: 10,
    search: search.trim() || undefined,
    categoria: (category || undefined) as Categoria | undefined,
    status: (status || undefined) as Status | undefined,
  });

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

  function clearFilters() {
    setSearch('');
    setCategory('');
    setStatus('');
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
    <div className="w-[min(1120px,calc(100%-76px))] mx-auto py-8 max-md:w-[calc(100%-40px)] max-sm:w-[calc(100%-30px)] max-sm:pt-4.5">
      <header className="flex items-center gap-2.5 text-xs font-semibold text-muted mb-11 max-md:mb-7.5 max-md:pl-12 max-sm:mb-7 max-sm:text-[11px]">
        <Link to="/" className="text-zinc-900 font-bold">Seu espaço</Link>
        <span className="h-[3px] w-[3px] bg-zinc-500 rounded-full" />Solicitações
      </header>

      <section className="flex items-end justify-between gap-6 mb-6.5 max-sm:items-start max-sm:flex-col max-sm:gap-4 max-sm:mb-5.5">
        <div>
          <div className="text-[11px] tracking-[1.25px] font-extrabold text-violet-800 mb-2.5">GESTÃO DO DIA A DIA</div>
          <h1 className="font-display font-extrabold text-4xl leading-tight tracking-tight text-ink max-sm:text-[28px]">Solicitações</h1>
          <p className="text-sm text-zinc-800 font-medium mt-2.5 max-sm:text-[13px]">Organize pedidos e acompanhe cada etapa com clareza.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 rounded-[10px] text-[13px] font-semibold whitespace-nowrap bg-ink !text-white border border-ink shadow-sm hover:bg-zinc-800 hover:-translate-y-px transition-all cursor-pointer"
          onClick={openCreate}
        >
          <Plus size={16} className="!text-white shrink-0" />
          <span className="!text-white">Nova solicitação</span>
        </button>
      </section>

      <section className="bg-white border border-line rounded-2xl shadow-sm p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line max-sm:flex-wrap max-sm:p-[11px] max-sm:gap-[7px]">
          <label className="h-9 flex items-center gap-2 flex-1 min-w-40 border border-zinc-200 rounded-lg px-2.5 text-zinc-600 bg-white shadow-2xs transition-all focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-600/15 max-sm:basis-full">
            <Search size={15} className="shrink-0 text-zinc-400" />
            <input
              className="min-w-0 flex-1 border-0 outline-none text-ink text-[12.5px] font-medium bg-transparent placeholder:text-zinc-400"
              aria-label="Buscar solicitações"
              placeholder="Buscar pelo título…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <kbd className="text-[10px] font-semibold py-[2px] px-1.5 border border-zinc-200 rounded text-zinc-500 bg-zinc-50 whitespace-nowrap">⌘ K</kbd>
          </label>

          <CustomSelect
            variant="toolbar"
            value={category}
            onChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
            options={CATEGORIA_FILTER_OPTIONS}
            leadingIcon={<SlidersHorizontal size={15} />}
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

          {(search || category || status) && (
            <button
              className="flex items-center gap-1.5 border-0 bg-transparent text-violet-800 text-xs font-bold whitespace-nowrap py-1.5 px-2 rounded-md transition-colors hover:bg-violet-100 hover:text-violet-900 cursor-pointer max-sm:p-1"
              onClick={clearFilters}
            >
              <CircleX size={15} /> Limpar
            </button>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[790px]">
            <thead>
              <tr>
                <th className="h-10 bg-zinc-100 text-ink text-[11.5px] tracking-wide font-bold px-3.5 border-b border-line first:pl-5">Solicitação</th>
                <th className="h-10 bg-zinc-100 text-ink text-[11.5px] tracking-wide font-bold px-3.5 border-b border-line w-[130px]">Área</th>
                <th className="h-10 bg-zinc-100 text-ink text-[11.5px] tracking-wide font-bold px-3.5 border-b border-line w-[140px]">Solicitante</th>
                <th className="h-10 bg-zinc-100 text-ink text-[11.5px] tracking-wide font-bold px-3.5 border-b border-line w-[130px]">Data</th>
                <th className="h-10 bg-zinc-100 text-ink text-[11.5px] tracking-wide font-bold px-3.5 border-b border-line w-[140px]">Status</th>
                <th className="h-10 bg-zinc-100 text-ink text-[11.5px] tracking-wide font-bold px-3.5 border-b border-line last:pr-4.5 last:w-[78px]">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="last:[&_td]:border-b-0">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="h-[70px] py-2.5 px-3.5 border-b border-line !h-[100px] text-center text-[13px] font-medium text-zinc-800">
                    Carregando solicitações…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="h-[70px] py-2.5 px-3.5 border-b border-line !h-[100px] text-center text-[13px] font-medium !text-red-700">
                    Não foi possível carregar as solicitações. Tente novamente em instantes.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-[70px] py-2.5 px-3.5 border-b border-line">
                    <div className="min-h-[260px] flex flex-col justify-center items-center text-center">
                      <span className="h-[46px] w-[46px] rounded-[13px] bg-violet-100 text-violet-800 grid place-items-center mb-3.5">
                        <ClipboardList size={22} />
                      </span>
                      <strong className="font-display font-bold text-[15px] text-ink">Nenhum pedido encontrado</strong>
                      <p className="text-[13px] text-muted font-medium mt-[7px] mb-2">
                        {search || category || status
                           ? 'Ajuste os filtros e tente de novo.'
                          : 'Crie a primeira solicitação para começar.'}
                      </p>
                      {search || category || status ? (
                        <button
                          className="border-0 bg-none inline-flex items-center gap-1.5 text-violet-800 font-bold text-[12.5px] py-1 hover:text-violet-900 hover:underline"
                          onClick={clearFilters}
                        >
                          Limpar filtros <ArrowRight size={15} />
                        </button>
                      ) : (
                        <button
                          className="border-0 bg-none inline-flex items-center gap-1.5 text-violet-800 font-bold text-[12.5px] py-1 hover:text-violet-900 hover:underline"
                          onClick={openCreate}
                        >
                          Criar solicitação <ArrowRight size={15} />
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
                    <tr key={item.id} className="hover:bg-zinc-50">
                      <td className="h-[70px] py-2.5 px-3.5 border-b border-line first:pl-5">
                        <div className="flex items-center gap-[11px] min-w-[220px]">
                          <span
                            className={`w-9 h-9 shrink-0 rounded-[10px] grid place-items-center bg-violet-100 text-violet-800 max-sm:h-8 max-sm:w-8 ${CATEGORY_STYLES[item.categoria.toLowerCase()] ?? ''}`}
                          >
                            <ClipboardList size={16} />
                          </span>
                          <div className="min-w-0">
                            <strong className="block max-w-[280px] truncate text-[13.5px] font-bold text-ink">{item.titulo}</strong>
                            <small className="block max-w-[280px] truncate text-[11.5px] text-muted font-medium mt-1">
                              {truncate(item.descricao, 62)}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="h-[70px] py-2.5 px-3.5 border-b border-line w-[130px]">
                        <div className="flex items-center gap-1.5 text-zinc-900 text-[12px] font-medium whitespace-nowrap">
                          <span
                            className="h-2 w-2 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: CATEGORY_DOTS[item.categoria] ?? '#71717a' }}
                          />
                          <span>{item.categoria}</span>
                        </div>
                      </td>
                      <td className="h-[70px] py-2.5 px-3.5 border-b border-line w-[140px]">
                        <span className="text-[12.5px] text-zinc-900 font-medium whitespace-nowrap">{item.solicitante ?? '—'}</span>
                      </td>
                      <td className="h-[70px] py-2.5 px-3.5 border-b border-line w-[130px]">
                        <span className="text-[12.5px] text-zinc-900 font-medium whitespace-nowrap">{formatDate(item.data_criacao)}</span>
                      </td>
                      <td className="h-[70px] py-2.5 px-3.5 border-b border-line w-[140px]">
                        <StatusDropdown
                          status={item.status}
                          disabled={updateStatus.isPending && updateStatus.variables?.id === item.id}
                          onChange={(newStatus) => updateStatus.mutate({ id: item.id, status: newStatus })}
                        />
                      </td>
                      <td className="h-[70px] py-2.5 px-3.5 border-b border-line first:pl-5 last:pr-4.5 last:w-[78px]">
                        <div className="flex items-center gap-0.5">
                          {canEdit && (
                            <button
                              className="border-0 bg-transparent rounded-lg text-zinc-800 grid place-items-center h-[30px] w-[30px] transition-all duration-150 hover:bg-zinc-100 hover:text-black"
                              title="Editar solicitação"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              className="border-0 bg-transparent rounded-lg text-zinc-800 grid place-items-center h-[30px] w-[30px] transition-all duration-150 hover:!bg-red-100 hover:!text-red-700"
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

        <div className="min-h-[58px] px-4.5 border-t border-line flex items-center justify-between text-zinc-800 text-xs font-semibold max-sm:px-3 max-sm:text-[11px]">
          <span>
            {data?.total ?? 0} {(data?.total ?? 0) === 1 ? 'solicitação encontrada' : 'solicitações encontradas'}
          </span>
          <div className="flex items-center gap-2 max-sm:gap-1.5">
            <span className="mr-2 max-sm:mr-1">
              Página <strong className="text-ink font-extrabold">{page}</strong> de <strong className="text-ink font-extrabold">{totalPages}</strong>
            </span>
            <button
              className="h-[30px] w-[30px] grid place-items-center border border-zinc-300 rounded-[7px] bg-white text-ink font-semibold hover:enabled:bg-zinc-100 max-sm:h-7 max-sm:w-7"
              aria-label="Página anterior"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="h-[30px] w-[30px] grid place-items-center border border-zinc-300 rounded-[7px] bg-white text-ink font-semibold hover:enabled:bg-zinc-100 max-sm:h-7 max-sm:w-7"
              aria-label="Próxima página"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-[7px] mt-3 mx-1 text-muted text-[11.5px] font-medium">
        <ArrowDownUp size={14} /> Os pedidos mais recentes aparecem primeiro.
      </div>

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

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}
