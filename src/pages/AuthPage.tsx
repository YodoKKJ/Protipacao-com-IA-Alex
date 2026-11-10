import { useState, type FormEvent } from 'react'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Brand } from '../components/Brand'

interface Props {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (name: string, email: string, password: string) => Promise<void>
}

export function AuthPage({ onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (mode === 'register') await onRegister(name, email, password)
      else await onLogin(email, password)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="auth-layout">
      <div className="auth-intro">
        <Brand />
        <span className="auth-eyebrow">SEU ESPAÇO PESSOAL</span>
        <h1>Compartilhar é bom. Lembrar também.</h1>
        <p>Registre o que emprestou, acompanhe prazos e mantenha tudo em ordem.</p>
        <div className="auth-decoration" aria-hidden="true">
          ↗
        </div>
      </div>
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-card">
          <span className="auth-icon">
            <LockKeyhole size={23} />
          </span>
          <h2 id="auth-title">{mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}</h2>
          <p>
            {mode === 'login'
              ? 'Entre para ver seus empréstimos.'
              : 'Seus registros ficam salvos com segurança.'}
          </p>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <label>
                Seu nome
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={100}
                />
              </label>
            )}
            <label>
              E-mail
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={mode === 'register' ? 8 : undefined}
              />
            </label>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button--primary button--full" disabled={saving}>
              {saving ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}{' '}
              <ArrowRight size={18} />
            </button>
          </form>
          <button
            className="auth-switch"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </section>
    </main>
  )
}
