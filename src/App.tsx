import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useLoans } from './application/useLoans'
import { useAuth } from './application/useAuth'
import type { LoanDraft } from './domain/loan'
import { MobileNav } from './components/MobileNav'
import { Sidebar } from './components/Sidebar'
import { Brand } from './components/Brand'
import { DetailPage } from './pages/DetailPage'
import { EditPage } from './pages/EditPage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { NewPage } from './pages/NewPage'
import { NotFound } from './pages/NotFound'
import { AuthPage } from './pages/AuthPage'

type Notice = { message: string; kind: 'success' | 'error' }

export default function App() {
  const auth = useAuth()
  if (auth.loading)
    return (
      <div className="auth-loading" role="status">
        Carregando EmprestaAí...
      </div>
    )
  if (!auth.user) return <AuthPage onLogin={auth.login} onRegister={auth.register} />
  return <LoanApp name={auth.user.name} onLogout={auth.logout} />
}

function LoanApp({ name, onLogout }: { name: string; onLogout: () => Promise<void> }) {
  const { loans, loading, loadError, createLoan, updateLoan, returnLoan } = useLoans()
  const [notice, setNotice] = useState<Notice | null>(null)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 4200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  async function handleCreate(draft: LoanDraft): Promise<string> {
    const id = await createLoan(draft)
    setNotice({ message: 'Empréstimo salvo com sucesso.', kind: 'success' })
    return id
  }

  async function handleUpdate(id: string, draft: LoanDraft): Promise<void> {
    await updateLoan(id, draft)
    setNotice({ message: 'Alterações salvas com sucesso.', kind: 'success' })
  }

  async function handleReturn(id: string): Promise<void> {
    await returnLoan(id)
    setNotice({ message: 'Devolução registrada. Objeto movido para o histórico.', kind: 'success' })
  }

  return (
    <div className="app-shell">
      <Sidebar openCount={loans.filter((loan) => !loan.returnedAt).length} />
      <div className="main-shell">
        <header className="mobile-header">
          <Brand />
          <span className="mobile-greeting">Olá, {name.split(' ')[0]}</span>
        </header>
        <main id="main-content" key={location.pathname}>
          {loading ? (
            <div className="page loading-state" role="status">
              Carregando empréstimos...
            </div>
          ) : loadError ? (
            <div className="page loading-state" role="alert">
              <p>Não foi possível carregar os empréstimos.</p>
              <button className="button button--primary" onClick={() => window.location.reload()}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage loans={loans} />} />
              <Route path="/novo" element={<NewPage onCreate={handleCreate} />} />
              <Route path="/historico" element={<HistoryPage loans={loans} />} />
              <Route
                path="/emprestimo/:id"
                element={<DetailPage loans={loans} onReturn={handleReturn} />}
              />
              <Route
                path="/emprestimo/:id/editar"
                element={<EditPage loans={loans} onUpdate={handleUpdate} />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </main>
        <footer className="footer">
          <span>EmprestaAí · Seus empréstimos, em um só lugar</span>
          <button onClick={() => void onLogout()}>Sair da conta</button>
        </footer>
      </div>
      <MobileNav />
      {notice && (
        <div
          className={`toast ${notice.kind === 'error' ? 'toast--error' : ''}`}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          {notice.kind === 'error' ? (
            <AlertCircle size={19} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={19} aria-hidden="true" />
          )}
          {notice.message}
          <button onClick={() => setNotice(null)} aria-label="Fechar aviso">
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  )
}
