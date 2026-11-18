import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import type { Loan } from '../domain/loan'
import { NoteApi } from '../infrastructure/NoteApi'
import { PageTitle } from '../components/PageTitle'

const noteApi = new NoteApi()

function centsFrom(value: string): number {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return NaN
  return Math.round(Number(normalized) * 100)
}

export function NewNotePage({ loans }: { loans: Loan[] }) {
  const [params] = useSearchParams()
  const loan = loans.find((item) => item.id === params.get('emprestimo'))
  const [recipient, setRecipient] = useState(loan?.person ?? '')
  const [description, setDescription] = useState(loan?.item ?? '')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const amountCents = centsFrom(amount)
    if (
      !recipient.trim() ||
      !description.trim() ||
      !Number.isSafeInteger(amountCents) ||
      amountCents <= 0
    ) {
      setError('Preencha destinatário, descrição e um valor maior que zero.')
      return
    }
    setSaving(true)
    try {
      const note = await noteApi.issue({ recipient, description, amountCents })
      navigate(`/notas/${note.id}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível emitir a nota.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page page-enter">
      <div className="topline">
        <span>Seu espaço de empréstimos</span>
        <span className="topline-date">Nova nota</span>
      </div>
      <PageTitle
        backTo="/notas"
        description="Preencha os dados para criar uma nota de demonstração."
      >
        Emitir nota<span className="heading-period">.</span>
      </PageTitle>
      <div className="note-disclaimer" role="note">
        <FilePlus2 size={19} aria-hidden="true" />
        <span>Documento simulado, sem validade fiscal. Nenhum dado será enviado à SEFAZ.</span>
      </div>
      <form className="form-card note-form" onSubmit={submit}>
        <div className="form-intro">
          <span className="form-intro-icon">
            <FilePlus2 size={22} aria-hidden="true" />
          </span>
          <div>
            <h2>Dados da nota</h2>
            <p>O número e a data serão gerados automaticamente.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field field--full">
            <label htmlFor="note-recipient">
              Destinatário <span>*</span>
            </label>
            <input
              id="note-recipient"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              maxLength={120}
              required
              placeholder="Ex.: Ana"
            />
          </div>
          <div className="field field--full">
            <label htmlFor="note-description">
              Descrição <span>*</span>
            </label>
            <textarea
              id="note-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              required
              rows={3}
              placeholder="Ex.: Livro emprestado"
            />
          </div>
          <div className="field">
            <label htmlFor="note-amount">
              Valor demonstrativo (R$) <span>*</span>
            </label>
            <input
              id="note-amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              placeholder="Ex.: 45,90"
              aria-describedby="note-amount-help"
            />
            <small id="note-amount-help">Use vírgula ou ponto para separar os centavos.</small>
          </div>
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Link className="button button--quiet" to="/notas">
            Cancelar
          </Link>
          <button className="button button--primary" disabled={saving} type="submit">
            {saving ? 'Emitindo...' : 'Emitir nota simulada'}
          </button>
        </div>
      </form>
    </div>
  )
}
