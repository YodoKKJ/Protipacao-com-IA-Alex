import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarDays, Camera, Check, CheckCircle2,
  ChevronRight, Clock3, History, Home, Info, Package, Plus, Search, Sparkles,
  Wrench, X,
} from 'lucide-react'
import { formatDate, getItemKind, loadLoans, saveLoans, seedLoans, shortDate } from './data'
import type { Loan } from './data'

const kindIcons = { book: BookOpen, tool: Wrench, camera: Camera, other: Package }

function todayISO() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function ItemVisual({ item, large = false }: { item: string; large?: boolean }) {
  const kind = getItemKind(item)
  const Icon = kindIcons[kind]
  return <span className={`item-visual item-visual--${kind} ${large ? 'item-visual--large' : ''}`} aria-hidden="true"><Icon strokeWidth={1.6} /></span>
}

function Sidebar({ openCount }: { openCount: number }) {
  return <aside className="sidebar">
    <Link to="/" className="brand" aria-label="EmprestaAí, ir para início">
      <span className="brand-mark"><span /><span /></span>
      <span>Empresta<span className="brand-accent">Aí</span></span>
    </Link>
    <p className="sidebar-label">Seu espaço</p>
    <nav className="side-nav" aria-label="Navegação principal">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}><Home size={19} aria-hidden="true" /> Em aberto <span className="nav-count">{openCount}</span></NavLink>
      <NavLink to="/historico" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}><History size={19} aria-hidden="true" /> Histórico</NavLink>
    </nav>
    <div className="sidebar-bottom">
      <div className="sidebar-note"><Sparkles size={18} aria-hidden="true" /><p>Um lugar tranquilo para lembrar de tudo que você compartilhou.</p></div>
      <span className="demo-tag"><span /> Versão de demonstração</span>
    </div>
  </aside>
}

function MobileNav() {
  return <nav className="mobile-nav" aria-label="Navegação principal">
    <NavLink to="/" end className={({ isActive }) => `mobile-nav-item ${isActive ? 'is-active' : ''}`}><Home size={21} aria-hidden="true" /><span>Em aberto</span></NavLink>
    <NavLink to="/novo" className={({ isActive }) => `mobile-nav-item mobile-nav-item--new ${isActive ? 'is-active' : ''}`}><span className="mobile-plus"><Plus size={22} aria-hidden="true" /></span><span>Novo</span></NavLink>
    <NavLink to="/historico" className={({ isActive }) => `mobile-nav-item ${isActive ? 'is-active' : ''}`}><History size={21} aria-hidden="true" /><span>Histórico</span></NavLink>
  </nav>
}

function LoanCard({ loan, index }: { loan: Loan; index: number }) {
  const isLate = !loan.returnedAt && !!loan.dueAt && loan.dueAt < todayISO()
  return <Link to={`/emprestimo/${loan.id}`} className="loan-card" style={{ animationDelay: `${Math.min(index, 5) * 55}ms` }}>
    <ItemVisual item={loan.item} />
    <span className="loan-card-main"><strong>{loan.item}</strong><span>Com {loan.person}</span></span>
    <span className="loan-card-side"><span className={`status-pill ${loan.returnedAt ? 'status-pill--done' : isLate ? 'status-pill--late' : ''}`}>{loan.returnedAt ? 'Devolvido' : isLate ? 'Prazo passou' : 'Em aberto'}</span><small>{loan.returnedAt ? shortDate(loan.returnedAt) : shortDate(loan.lentAt)}</small></span>
    <ChevronRight size={20} className="loan-chevron" aria-hidden="true" />
  </Link>
}

function PageTitle({ backTo, children, description }: { backTo?: string; children: ReactNode; description?: string }) {
  return <div className="page-heading">
    {backTo && <Link to={backTo} className="back-link"><ArrowLeft size={18} aria-hidden="true" /> Voltar</Link>}
    <h1>{children}</h1>
    {description && <p>{description}</p>}
  </div>
}

function HomePage({ loans }: { loans: Loan[] }) {
  const openLoans = loans.filter(loan => !loan.returnedAt)
  const [query, setQuery] = useState('')
  const visible = openLoans.filter(loan => `${loan.item} ${loan.person}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))
  return <div className="page page-enter">
    <div className="topline"><span>Seu espaço de empréstimos</span><span className="topline-date">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}</span></div>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy"><div className="hero-kicker"><span className="hero-kicker-dot" /> Tudo em seu lugar</div><h1 id="hero-title">O que é seu,<br /><em>sempre por perto.</em></h1><p>Guarde os detalhes de cada empréstimo e acompanhe o caminho de volta dos seus objetos.</p><Link className="button button--white" to="/novo"><Plus size={18} aria-hidden="true" /> Novo empréstimo <ArrowRight size={17} aria-hidden="true" /></Link></div>
      <div className="hero-art" aria-hidden="true"><div className="art-halo" /><div className="art-back" /><div className="art-book"><span>O pequeno<br />príncipe</span><BookOpen size={32} strokeWidth={1.3} /></div><div className="art-chip"><Check size={14} /> Tudo anotado</div></div>
    </section>
    <div className="section-top"><div><h2>Em aberto <span className="title-count">{openLoans.length}</span></h2><p>Objetos que ainda estão com outras pessoas.</p></div><Link to="/novo" className="text-action">Adicionar <Plus size={17} aria-hidden="true" /></Link></div>
    {openLoans.length > 0 && <div className="search-wrap"><Search size={19} aria-hidden="true" /><label className="sr-only" htmlFor="loan-search">Buscar por objeto ou pessoa</label><input id="loan-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar objeto ou pessoa" /></div>}
    {visible.length ? <div className="loan-list">{visible.map((loan, index) => <LoanCard key={loan.id} loan={loan} index={index} />)}</div> : <div className="empty-state"><div className="empty-icon"><Package size={30} strokeWidth={1.5} aria-hidden="true" /></div><h3>{query ? 'Nada por aqui' : 'Nenhum empréstimo em aberto'}</h3><p>{query ? 'Tente buscar outro objeto ou pessoa.' : 'Quando emprestar algo, registre aqui para lembrar de todos os detalhes.'}</p>{!query && <Link to="/novo" className="button button--primary"><Plus size={18} aria-hidden="true" /> Registrar empréstimo</Link>}</div>}
    <div className="helper-line"><Info size={16} aria-hidden="true" /> Dados de demonstração salvos apenas neste navegador.</div>
  </div>
}

function HistoryPage({ loans }: { loans: Loan[] }) {
  const returned = loans.filter(loan => loan.returnedAt).sort((a, b) => (b.returnedAt || '').localeCompare(a.returnedAt || ''))
  return <div className="page page-enter"><div className="topline"><span>Seu espaço de empréstimos</span><span className="topline-date">Histórico</span></div><PageTitle description="Objetos que já encontraram o caminho de volta.">Histórico</PageTitle>{returned.length ? <div className="loan-list">{returned.map((loan, index) => <LoanCard key={loan.id} loan={loan} index={index} />)}</div> : <div className="empty-state"><div className="empty-icon"><History size={30} strokeWidth={1.5} aria-hidden="true" /></div><h3>O histórico começa aqui</h3><p>Quando um objeto for devolvido, ele aparecerá nesta página.</p><Link to="/" className="button button--primary">Ver empréstimos</Link></div>}</div>
}

type FormValues = Pick<Loan, 'item' | 'person' | 'lentAt' | 'dueAt' | 'note'>
type FormErrors = Partial<Record<keyof FormValues, string>>

function LoanForm({ initial, onSave }: { initial?: Loan; onSave: (values: FormValues) => void }) {
  const [values, setValues] = useState<FormValues>({ item: initial?.item ?? '', person: initial?.person ?? '', lentAt: initial?.lentAt ?? todayISO(), dueAt: initial?.dueAt ?? '', note: initial?.note ?? '' })
  const [errors, setErrors] = useState<FormErrors>({})

  function update(key: keyof FormValues, value: string) {
    setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: FormErrors = {}
    if (!values.item.trim()) next.item = 'Informe o objeto emprestado.'
    if (!values.person.trim()) next.person = 'Informe quem recebeu o objeto.'
    if (!values.lentAt) next.lentAt = 'Escolha a data do empréstimo.'
    if (values.dueAt && values.lentAt && values.dueAt < values.lentAt) next.dueAt = 'A previsão não pode ser anterior ao empréstimo.'
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus()
      return
    }
    onSave({ item: values.item.trim(), person: values.person.trim(), lentAt: values.lentAt, dueAt: values.dueAt, note: values.note.trim() })
  }

  return <form className="form-card" onSubmit={submit} noValidate>
    <div className="form-intro"><span className="form-intro-icon"><Package size={22} strokeWidth={1.7} aria-hidden="true" /></span><div><h2>Detalhes do empréstimo</h2><p>Só o essencial para você lembrar depois.</p></div></div>
    <div className="form-grid">
      <div className="field field--full"><label htmlFor="item">O que você emprestou? <span>*</span></label><input id="item" value={values.item} onChange={event => update('item', event.target.value)} placeholder="Ex.: O pequeno príncipe" autoComplete="off" aria-invalid={!!errors.item} aria-describedby={errors.item ? 'item-error' : undefined} />{errors.item && <p className="field-error" id="item-error">{errors.item}</p>}</div>
      <div className="field field--full"><label htmlFor="person">Para quem? <span>*</span></label><input id="person" value={values.person} onChange={event => update('person', event.target.value)} placeholder="Ex.: Ana" autoComplete="name" aria-invalid={!!errors.person} aria-describedby={errors.person ? 'person-error' : undefined} />{errors.person && <p className="field-error" id="person-error">{errors.person}</p>}</div>
      <div className="field"><label htmlFor="lentAt">Data do empréstimo <span>*</span></label><div className="date-field"><CalendarDays size={18} aria-hidden="true" /><input id="lentAt" type="date" value={values.lentAt} onChange={event => update('lentAt', event.target.value)} aria-invalid={!!errors.lentAt} aria-describedby={errors.lentAt ? 'lentAt-error' : undefined} /></div>{errors.lentAt && <p className="field-error" id="lentAt-error">{errors.lentAt}</p>}</div>
      <div className="field"><label htmlFor="dueAt">Devolução prevista <span className="optional">Opcional</span></label><div className="date-field"><CalendarDays size={18} aria-hidden="true" /><input id="dueAt" type="date" min={values.lentAt} value={values.dueAt} onChange={event => update('dueAt', event.target.value)} aria-invalid={!!errors.dueAt} aria-describedby={errors.dueAt ? 'dueAt-error' : undefined} /></div>{errors.dueAt && <p className="field-error" id="dueAt-error">{errors.dueAt}</p>}</div>
      <div className="field field--full"><label htmlFor="note">Algum detalhe importante? <span className="optional">Opcional</span></label><textarea id="note" rows={3} value={values.note} onChange={event => update('note', event.target.value)} placeholder="Ex.: junto com a capa ou acessórios" /></div>
    </div>
    <div className="form-actions"><Link className="button button--quiet" to={initial ? `/emprestimo/${initial.id}` : '/'}>Cancelar</Link><button className="button button--primary" type="submit"><Check size={18} aria-hidden="true" /> {initial ? 'Salvar alterações' : 'Salvar empréstimo'}</button></div>
  </form>
}

function NewPage({ onCreate }: { onCreate: (values: FormValues) => string }) {
  const navigate = useNavigate()
  return <div className="page page-enter"><div className="topline"><span>Seu espaço de empréstimos</span><span className="topline-date">Novo empréstimo</span></div><PageTitle backTo="/" description="Um registro rápido para você não precisar confiar na memória.">Novo empréstimo<span className="heading-period">.</span></PageTitle><LoanForm onSave={values => navigate(`/emprestimo/${onCreate(values)}`)} /></div>
}

function EditPage({ loans, onUpdate }: { loans: Loan[]; onUpdate: (id: string, values: FormValues) => void }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const loan = loans.find(item => item.id === id)
  if (!loan) return <NotFound />
  return <div className="page page-enter"><div className="topline"><span>Seu espaço de empréstimos</span><span className="topline-date">Editar</span></div><PageTitle backTo={`/emprestimo/${loan.id}`} description="Atualize os detalhes que mudaram.">Editar empréstimo<span className="heading-period">.</span></PageTitle><LoanForm initial={loan} onSave={values => { onUpdate(loan.id, values); navigate(`/emprestimo/${loan.id}`) }} /></div>
}

function ConfirmDialog({ item, onClose, onConfirm }: { item: string; onClose: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description"><button className="dialog-close" onClick={onClose} aria-label="Fechar confirmação"><X size={20} /></button><div className="dialog-icon"><CheckCircle2 size={27} aria-hidden="true" /></div><h2 id="dialog-title">Objeto devolvido?</h2><p id="dialog-description">“{item}” sairá da lista de empréstimos em aberto e aparecerá no histórico.</p><div className="dialog-actions"><button className="button button--quiet" onClick={onClose}>Cancelar</button><button ref={confirmRef} className="button button--primary" onClick={onConfirm}>Confirmar devolução</button></div></div></div>
}

function DetailPage({ loans, onReturn }: { loans: Loan[]; onReturn: (id: string) => void }) {
  const { id } = useParams()
  const [confirming, setConfirming] = useState(false)
  const loan = loans.find(item => item.id === id)
  if (!loan) return <NotFound />
  const isLate = !loan.returnedAt && !!loan.dueAt && loan.dueAt < todayISO()
  return <div className="page page-enter"><div className="topline"><span>Seu espaço de empréstimos</span><span className="topline-date">Detalhes</span></div><PageTitle backTo={loan.returnedAt ? '/historico' : '/'} description="Tudo que você precisa lembrar sobre este objeto.">Detalhes<span className="heading-period">.</span></PageTitle><div className="detail-layout"><section className="detail-main"><div className="detail-object"><ItemVisual item={loan.item} large /><div><span className={`status-pill ${loan.returnedAt ? 'status-pill--done' : isLate ? 'status-pill--late' : ''}`}>{loan.returnedAt ? 'Devolvido' : isLate ? 'Prazo passou' : 'Em aberto'}</span><h2>{loan.item}</h2><p>{loan.returnedAt ? 'Já está de volta com você.' : `Está com ${loan.person}.`}</p></div></div><div className="detail-facts"><div><span>Pessoa</span><strong>{loan.person}</strong></div><div><span>Emprestado em</span><strong>{formatDate(loan.lentAt)}</strong></div><div><span>Devolução prevista</span><strong>{formatDate(loan.dueAt)}</strong></div>{loan.returnedAt && <div><span>Devolvido em</span><strong>{formatDate(loan.returnedAt)}</strong></div>}</div>{loan.note && <div className="detail-note"><span>Observação</span><p>{loan.note}</p></div>}</section><aside className="detail-aside"><div className="aside-icon">{loan.returnedAt ? <CheckCircle2 size={24} aria-hidden="true" /> : <Clock3 size={24} aria-hidden="true" />}</div><h3>{loan.returnedAt ? 'De volta ao seu lugar.' : 'Acompanhando para você.'}</h3><p>{loan.returnedAt ? 'Este empréstimo foi concluído e ficará guardado no histórico.' : 'Quando o objeto voltar, confirme a devolução para manter tudo atualizado.'}</p>{!loan.returnedAt && <><button className="button button--primary button--full" onClick={() => setConfirming(true)}><Check size={18} aria-hidden="true" /> Marcar como devolvido</button><Link className="button button--quiet button--full" to={`/emprestimo/${loan.id}/editar`}>Editar detalhes</Link></>}</aside></div>{confirming && <ConfirmDialog item={loan.item} onClose={() => setConfirming(false)} onConfirm={() => { onReturn(loan.id); setConfirming(false) }} />}</div>
}

function NotFound() {
  return <div className="page page-enter"><PageTitle backTo="/" description="Este empréstimo não foi encontrado nesta demonstração.">Não encontramos esse objeto.</PageTitle><Link to="/" className="button button--primary">Voltar ao início</Link></div>
}

export default function App() {
  const [loans, setLoans] = useState<Loan[]>(loadLoans)
  const [notice, setNotice] = useState('')
  const location = useLocation()
  useEffect(() => saveLoans(loans), [loans])
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function createLoan(values: FormValues) {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setLoans(current => [{ id, ...values, returnedAt: null }, ...current])
    setNotice('Empréstimo salvo com sucesso.')
    return id
  }
  function updateLoan(id: string, values: FormValues) {
    setLoans(current => current.map(loan => loan.id === id ? { ...loan, ...values } : loan))
    setNotice('Alterações salvas com sucesso.')
  }
  function returnLoan(id: string) {
    setLoans(current => current.map(loan => loan.id === id ? { ...loan, returnedAt: todayISO() } : loan))
    setNotice('Devolução registrada. Objeto movido para o histórico.')
  }
  function resetDemo() {
    setLoans(seedLoans)
    setNotice('Dados de demonstração restaurados.')
  }

  return <div className="app-shell"><Sidebar openCount={loans.filter(loan => !loan.returnedAt).length} /><div className="main-shell"><header className="mobile-header"><Link to="/" className="brand" aria-label="EmprestaAí, ir para início"><span className="brand-mark"><span /><span /></span><span>Empresta<span className="brand-accent">Aí</span></span></Link><span className="mobile-demo">Demo</span></header><main id="main-content" key={location.pathname}><Routes><Route path="/" element={<HomePage loans={loans} />} /><Route path="/novo" element={<NewPage onCreate={createLoan} />} /><Route path="/historico" element={<HistoryPage loans={loans} />} /><Route path="/emprestimo/:id" element={<DetailPage loans={loans} onReturn={returnLoan} />} /><Route path="/emprestimo/:id/editar" element={<EditPage loans={loans} onUpdate={updateLoan} />} /><Route path="*" element={<NotFound />} /></Routes></main><footer className="footer"><span>EmprestaAí · Front-end da Aula 2</span><button onClick={resetDemo}>Restaurar dados de exemplo</button></footer></div><MobileNav />{notice && <div className="toast" role="status"><CheckCircle2 size={19} aria-hidden="true" />{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={17} /></button></div>}</div>
}
