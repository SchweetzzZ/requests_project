import { useEffect, useState, type FormEvent } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowDownUp, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, CircleX, ClipboardList, FilePlus2, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAlterarStatus, useAtualizarSolicitacao, useCriarSolicitacao, useExcluirSolicitacao, useSolicitacoes } from '../hooks/useSolicitacoes';
import type { SolicitacaoListItem } from '../services/solicitacoes.service';
import type { components } from '../api/schema';
import { formatDate, StatusBadge } from './index';

type Categoria = components['schemas']['CriarSolicitacaoDto']['categoria'];
type Status = components['schemas']['AlterarStatusSolicitacaoDto']['status'];

export const Route = createFileRoute('/solicitacoes')({
  validateSearch: (search: Record<string, unknown>) => search.novo === true || search.novo === 'true' ? { novo: true as const } : {},
  component: RequestsPage,
});

const CATEGORIAS: Categoria[] = ['TI', 'RH', 'Compras', 'Financeiro', 'Infraestrutura'];
const STATUS: Status[] = ['Aberto', 'Em Atendimento', 'Concluído'];

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
  const { data, isLoading, isError } = useSolicitacoes({ page, limit: 10, search: search.trim() || undefined, categoria: (category || undefined) as Categoria | undefined, status: (status || undefined) as Status | undefined });
  const createRequest = useCriarSolicitacao();
  const updateRequest = useAtualizarSolicitacao();
  const updateStatus = useAlterarStatus();
  const deleteRequest = useExcluirSolicitacao();

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) navigate({ to: '/login' });
  }, [isAuthenticated, isLoadingUser, navigate]);

  useEffect(() => {
    if (novo) { setEditing(null); setTitle(''); setDescription(''); setFormCategory('TI'); setModalOpen(true); }
  }, [novo]);

  function openCreate() {
    setEditing(null); setTitle(''); setDescription(''); setFormCategory('TI'); setModalOpen(true);
  }

  function openEdit(item: SolicitacaoListItem) {
    setEditing(item); setTitle(item.titulo); setDescription(item.descricao); setFormCategory(item.categoria); setModalOpen(true);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editing) await updateRequest.mutateAsync({ id: editing.id, data: { titulo: title.trim(), descricao: description.trim(), categoria: formCategory } });
      else await createRequest.mutateAsync({ titulo: title.trim(), descricao: description.trim(), categoria: formCategory });
      setModalOpen(false);
    } catch { /* O hook exibe a mensagem da API. */ }
  }

  function clearFilters() { setSearch(''); setCategory(''); setStatus(''); setPage(1); }

  if (isLoadingUser || !isAuthenticated) return <div className="page-loading"><span className="loading-dot" />Preparando seu espaço…</div>;

  const rows = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isSaving = createRequest.isPending || updateRequest.isPending;

  return (
    <div className="page-shell">
      <header className="page-topline"><Link to="/" className="breadcrumb-home">Seu espaço</Link><span className="topline-dot" />Solicitações</header>
      <section className="page-heading requests-heading"><div><div className="eyebrow">GESTÃO DO DIA A DIA</div><h1>Solicitações</h1><p>Organize pedidos e acompanhe cada etapa com clareza.</p></div><button className="button button-primary" onClick={openCreate}><Plus size={18} /> Nova solicitação</button></section>
      <section className="panel requests-panel">
        <div className="list-toolbar">
          <label className="search-field"><Search size={17} /><input aria-label="Buscar solicitações" placeholder="Buscar pelo título…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><kbd>⌘ K</kbd></label>
          <label className="filter-select"><SlidersHorizontal size={16} /><select aria-label="Filtrar por categoria" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">Todas as áreas</option>{CATEGORIAS.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
          <label className="filter-select status-filter"><select aria-label="Filtrar por status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Todos os status</option>{STATUS.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
          {(search || category || status) && <button className="clear-filters" onClick={clearFilters}><CircleX size={15} /> Limpar</button>}
        </div>
        <div className="request-table-wrap">
          <table className="request-table"><thead><tr><th>Solicitação</th><th>Área</th><th>Solicitante</th><th>Data</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="table-message">Carregando solicitações…</td></tr> : isError ? <tr><td colSpan={6} className="table-message table-error">Não foi possível carregar as solicitações. Tente novamente em instantes.</td></tr> : rows.length === 0 ? <tr><td colSpan={6}><div className="table-empty"><span className="empty-table-icon"><ClipboardList size={22} /></span><strong>Nenhum pedido encontrado</strong><p>{search || category || status ? 'Ajuste os filtros e tente de novo.' : 'Crie a primeira solicitação para começar.'}</p>{search || category || status ? <button className="text-link" onClick={clearFilters}>Limpar filtros <ArrowRight size={15} /></button> : <button className="text-link" onClick={openCreate}>Criar solicitação <ArrowRight size={15} /></button>}</div></td></tr> : rows.map((item) => {
                const isOwner = item.usuario_id === user?.userId;
                const canEdit = isOwner && item.status === 'Aberto';
                return <tr key={item.id}>
                  <td><div className="request-name"><span className={`category-icon category-${item.categoria.toLowerCase()}`}><ClipboardList size={16} /></span><div><strong>{item.titulo}</strong><small>{truncate(item.descricao, 62)}</small></div></div></td>
                  <td><span className="category-pill">{item.categoria}</span></td>
                  <td><span className="requester-name">{item.solicitante ?? '—'}</span></td>
                  <td><span className="date-cell">{formatDate(item.data_criacao)}</span></td>
                  <td><label className="status-control"><StatusBadge status={item.status} /><select aria-label={`Alterar status de ${item.titulo}`} value={item.status} disabled={updateStatus.isPending} onChange={(event) => updateStatus.mutate({ id: item.id, status: event.target.value as Status })}>{STATUS.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={12} /></label></td>
                  <td><div className="row-actions">{canEdit && <button className="icon-button" title="Editar solicitação" onClick={() => openEdit(item)}><Pencil size={15} /></button>}{canEdit && <button className="icon-button danger-action" title="Excluir solicitação" onClick={() => { if (window.confirm(`Excluir “${item.titulo}”?`)) deleteRequest.mutate(item.id); }}><Trash2 size={15} /></button>}</div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>{data?.total ?? 0} {(data?.total ?? 0) === 1 ? 'solicitação encontrada' : 'solicitações encontradas'}</span><div className="pagination"><span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span><button aria-label="Página anterior" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={17} /></button><button aria-label="Próxima página" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight size={17} /></button></div></div>
      </section>
      <div className="list-footnote"><ArrowDownUp size={14} /> Os pedidos mais recentes aparecem primeiro.</div>

      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><section className="request-modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
        <header className="modal-header"><span className="modal-icon"><FilePlus2 size={19} /></span><button className="icon-button modal-close" aria-label="Fechar" onClick={() => setModalOpen(false)}><X size={19} /></button><div className="eyebrow">CENTRAL DE SOLICITAÇÕES</div><h2 id="request-modal-title">{editing ? 'Editar solicitação' : 'Nova solicitação'}</h2><p>Conte o que sua equipe precisa e escolha a área responsável.</p></header>
        <form onSubmit={submitForm} className="request-form"><label>Título<span className="required-star">*</span><input autoFocus maxLength={255} minLength={3} required placeholder="Ex.: Acesso ao sistema financeiro" value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Descrição<span className="required-star">*</span><textarea required minLength={3} maxLength={255} rows={4} placeholder="Descreva o contexto e o que precisa ser feito…" value={description} onChange={(event) => setDescription(event.target.value)} /><small className="char-count">{description.length}/255</small></label><label>Área responsável<span className="required-star">*</span><span className="form-select-wrap"><select value={formCategory} onChange={(event) => setFormCategory(event.target.value as Categoria)}>{CATEGORIAS.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></span></label><div className="form-note"><Check size={15} /> Você poderá acompanhar o andamento na lista de solicitações.</div><footer className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="button button-primary" disabled={isSaving}>{isSaving ? 'Salvando…' : editing ? 'Salvar alterações' : 'Criar solicitação'}<ArrowRight size={16} /></button></footer></form>
      </section></div>}
    </div>
  );
}

function truncate(value: string, length: number) { return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value; }
