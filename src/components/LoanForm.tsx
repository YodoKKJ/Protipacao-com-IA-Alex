import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, Package } from 'lucide-react'
import { todayISO } from '../domain/loan'
import type { Loan, LoanDraft } from '../domain/loan'

type FormErrors = Partial<Record<keyof LoanDraft, string>>

export function LoanForm({
  initial,
  onSave,
}: {
  initial?: Loan
  onSave: (values: LoanDraft) => Promise<void>
}) {
  const [values, setValues] = useState<LoanDraft>({
    item: initial?.item ?? '',
    person: initial?.person ?? '',
    lentAt: initial?.lentAt ?? todayISO(),
    dueAt: initial?.dueAt ?? '',
    note: initial?.note ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(key: keyof LoanDraft, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: FormErrors = {}
    if (!values.item.trim()) next.item = 'Informe o objeto emprestado.'
    if (!values.person.trim()) next.person = 'Informe quem recebeu o objeto.'
    if (!values.lentAt) next.lentAt = 'Escolha a data do empréstimo.'
    if (values.dueAt && values.lentAt && values.dueAt < values.lentAt)
      next.dueAt = 'A previsão não pode ser anterior ao empréstimo.'
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus()
      return
    }
    setSaving(true)
    setSubmitError('')
    try {
      await onSave({
        item: values.item.trim(),
        person: values.person.trim(),
        lentAt: values.lentAt,
        dueAt: values.dueAt,
        note: values.note.trim(),
      })
    } catch {
      setSubmitError('Não foi possível salvar. Confira os dados e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <div className="form-intro">
        <span className="form-intro-icon">
          <Package size={22} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <div>
          <h2>Detalhes do empréstimo</h2>
          <p>Só o essencial para você lembrar depois.</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field field--full">
          <label htmlFor="item">
            O que você emprestou? <span>*</span>
          </label>
          <input
            id="item"
            value={values.item}
            onChange={(event) => update('item', event.target.value)}
            placeholder="Ex.: O pequeno príncipe"
            autoComplete="off"
            aria-invalid={!!errors.item}
            aria-describedby={errors.item ? 'item-error' : undefined}
          />
          {errors.item && (
            <p className="field-error" id="item-error">
              {errors.item}
            </p>
          )}
        </div>
        <div className="field field--full">
          <label htmlFor="person">
            Para quem? <span>*</span>
          </label>
          <input
            id="person"
            value={values.person}
            onChange={(event) => update('person', event.target.value)}
            placeholder="Ex.: Ana"
            autoComplete="name"
            aria-invalid={!!errors.person}
            aria-describedby={errors.person ? 'person-error' : undefined}
          />
          {errors.person && (
            <p className="field-error" id="person-error">
              {errors.person}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="lentAt">
            Data do empréstimo <span>*</span>
          </label>
          <div className="date-field">
            <CalendarDays size={18} aria-hidden="true" />
            <input
              id="lentAt"
              type="date"
              value={values.lentAt}
              onChange={(event) => update('lentAt', event.target.value)}
              aria-invalid={!!errors.lentAt}
              aria-describedby={errors.lentAt ? 'lentAt-error' : undefined}
            />
          </div>
          {errors.lentAt && (
            <p className="field-error" id="lentAt-error">
              {errors.lentAt}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="dueAt">
            Devolução prevista <span className="optional">Opcional</span>
          </label>
          <div className="date-field">
            <CalendarDays size={18} aria-hidden="true" />
            <input
              id="dueAt"
              type="date"
              min={values.lentAt}
              value={values.dueAt}
              onChange={(event) => update('dueAt', event.target.value)}
              aria-invalid={!!errors.dueAt}
              aria-describedby={errors.dueAt ? 'dueAt-error' : undefined}
            />
          </div>
          {errors.dueAt && (
            <p className="field-error" id="dueAt-error">
              {errors.dueAt}
            </p>
          )}
        </div>
        <div className="field field--full">
          <label htmlFor="note">
            Algum detalhe importante? <span className="optional">Opcional</span>
          </label>
          <textarea
            id="note"
            rows={3}
            value={values.note}
            onChange={(event) => update('note', event.target.value)}
            placeholder="Ex.: junto com a capa ou acessórios"
          />
        </div>
      </div>
      {submitError && (
        <p className="field-error" role="alert">
          {submitError}
        </p>
      )}
      <div className="form-actions">
        <Link className="button button--quiet" to={initial ? `/emprestimo/${initial.id}` : '/'}>
          Cancelar
        </Link>
        <button className="button button--primary" type="submit" disabled={saving}>
          <Check size={18} aria-hidden="true" />{' '}
          {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Salvar empréstimo'}
        </button>
      </div>
    </form>
  )
}
