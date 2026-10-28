import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export function ConfirmDialog({
  item,
  onClose,
  onConfirm,
}: {
  item: string
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function confirm() {
    setSaving(true)
    setError('')
    try {
      await onConfirm()
    } catch {
      setError('Não foi possível registrar a devolução. Tente novamente.')
      setSaving(false)
    }
  }

  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, saving])
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <button
          className="dialog-close"
          onClick={onClose}
          aria-label="Fechar confirmação"
          disabled={saving}
        >
          <X size={20} />
        </button>
        <div className="dialog-icon">
          <CheckCircle2 size={27} aria-hidden="true" />
        </div>
        <h2 id="dialog-title">Objeto devolvido?</h2>
        <p id="dialog-description">
          “{item}” sairá da lista de empréstimos em aberto e aparecerá no histórico.
        </p>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button className="button button--quiet" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            ref={confirmRef}
            className="button button--primary"
            onClick={confirm}
            disabled={saving}
          >
            {saving ? 'Registrando...' : 'Confirmar devolução'}
          </button>
        </div>
      </div>
    </div>
  )
}
