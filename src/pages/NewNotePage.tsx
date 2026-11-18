import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FilePlus2, Plus, Trash2 } from 'lucide-react'
import type { Loan } from '../domain/loan'
import type { FiscalDraft, FiscalItem } from '../domain/fiscal'
import { NoteApi } from '../infrastructure/NoteApi'
import { formatMoney } from '../notePresentation'
import { PageTitle } from '../components/PageTitle'

const noteApi = new NoteApi()

function newItem(description = ''): FiscalItem {
  return {
    code: 'ITEM-001',
    description,
    ncm: '',
    cfop: '',
    cst: '',
    unit: 'UN',
    quantity: 1,
    unitPriceCents: 0,
    icmsRate: 0,
    ipiRate: 0,
  }
}

function initialFiscal(description: string): FiscalDraft {
  return {
    natureOperation: 'Remessa para empréstimo — simulação',
    series: '1',
    issuerDocument: '',
    issuerStateRegistration: '',
    issuerAddress: '',
    issuerCity: '',
    issuerState: '',
    issuerZip: '',
    recipientDocument: '',
    recipientAddress: '',
    recipientCity: '',
    recipientState: '',
    recipientZip: '',
    items: [newItem(description)],
    freightCents: 0,
    insuranceCents: 0,
    otherCents: 0,
    discountCents: 0,
    icmsBaseCents: 0,
    icmsCents: 0,
    ipiCents: 0,
    carrierName: '',
    freightMode: '9 - Sem frete',
    paymentMethod: 'Sem pagamento',
    additionalInfo: 'Documento criado exclusivamente para demonstração.',
  }
}

function Field({
  id,
  label,
  value,
  onChange,
  ...props
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange'>) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  )
}

function MoneyField({
  id,
  label,
  cents,
  onChange,
}: {
  id: string
  label: string
  cents: number
  onChange: (value: number) => void
}) {
  return (
    <Field
      id={id}
      label={label}
      value={cents ? String(cents / 100) : ''}
      onChange={(value) => onChange(Math.round(Number(value) * 100))}
      type="number"
      min="0"
      step="0.01"
      inputMode="decimal"
      placeholder="0,00"
    />
  )
}

export function NewNotePage({ loans }: { loans: Loan[] }) {
  const [params] = useSearchParams()
  const loan = loans.find((item) => item.id === params.get('emprestimo'))
  const [recipient, setRecipient] = useState(loan?.person ?? '')
  const [fiscal, setFiscal] = useState<FiscalDraft>(() => initialFiscal(loan?.item ?? ''))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  function setField<K extends keyof FiscalDraft>(key: K, value: FiscalDraft[K]) {
    setFiscal((current) => ({ ...current, [key]: value }))
  }

  function setItem<K extends keyof FiscalItem>(index: number, key: K, value: FiscalItem[K]) {
    setFiscal((current) => ({
      ...current,
      items: current.items.map((item, position) =>
        position === index ? { ...item, [key]: value } : item,
      ),
    }))
  }

  function loadExample() {
    setRecipient('Pessoa de Exemplo')
    setFiscal({
      ...initialFiscal('Livro de exemplo'),
      issuerDocument: '00.000.000/0000-00',
      issuerStateRegistration: '000000000',
      issuerAddress: 'Rua Exemplo, 100 - Centro',
      issuerCity: 'São Paulo',
      issuerState: 'SP',
      issuerZip: '00000-000',
      recipientDocument: '000.000.000-00',
      recipientAddress: 'Av. Modelo, 200',
      recipientCity: 'São Paulo',
      recipientState: 'SP',
      recipientZip: '00000-000',
      items: [
        {
          ...newItem('Livro de exemplo'),
          ncm: '00000000',
          cfop: '0000',
          cst: '000',
          unitPriceCents: 4590,
        },
      ],
    })
  }

  const productsCents = fiscal.items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPriceCents),
    0,
  )
  const totalCents =
    productsCents -
    fiscal.discountCents +
    fiscal.freightCents +
    fiscal.insuranceCents +
    fiscal.otherCents +
    fiscal.ipiCents

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!recipient.trim()) {
      setError('Informe o nome do destinatário.')
      return
    }
    setSaving(true)
    try {
      const note = await noteApi.issue({
        recipient,
        description: fiscal.items.map((item) => item.description).join('; '),
        amountCents: totalCents,
        fiscal,
      })
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
      <PageTitle backTo="/notas" description="Preencha os campos de uma DANFE de demonstração.">
        Emitir nota<span className="heading-period">.</span>
      </PageTitle>
      <div className="note-disclaimer" role="note">
        <FilePlus2 size={19} aria-hidden="true" />
        <span>
          Simulação local sem valor fiscal. Não gera XML, chave de acesso nem protocolo; nada é
          transmitido à SEFAZ.
        </span>
      </div>
      <div className="fiscal-form-toolbar">
        <button className="button button--quiet" type="button" onClick={loadExample}>
          Preencher exemplo fictício
        </button>
      </div>
      <form className="form-card fiscal-form" onSubmit={submit}>
        <section className="fiscal-form-section">
          <h2>Identificação da NF-e simulada</h2>
          <div className="form-grid">
            <Field
              id="nature"
              label="Natureza da operação"
              value={fiscal.natureOperation}
              onChange={(value) => setField('natureOperation', value)}
              required
              maxLength={100}
            />
            <Field
              id="series"
              label="Série"
              value={fiscal.series}
              onChange={(value) => setField('series', value)}
              required
              maxLength={3}
            />
          </div>
        </section>
        <section className="fiscal-form-section">
          <h2>Emitente</h2>
          <p>O nome do emitente vem da conta conectada.</p>
          <div className="form-grid">
            <Field
              id="issuer-document"
              label="CNPJ/CPF"
              value={fiscal.issuerDocument}
              onChange={(value) => setField('issuerDocument', value)}
              maxLength={18}
            />
            <Field
              id="issuer-ie"
              label="Inscrição estadual"
              value={fiscal.issuerStateRegistration}
              onChange={(value) => setField('issuerStateRegistration', value)}
              maxLength={20}
            />
            <Field
              id="issuer-address"
              label="Endereço completo"
              value={fiscal.issuerAddress}
              onChange={(value) => setField('issuerAddress', value)}
              maxLength={180}
            />
            <Field
              id="issuer-city"
              label="Município"
              value={fiscal.issuerCity}
              onChange={(value) => setField('issuerCity', value)}
              maxLength={80}
            />
            <Field
              id="issuer-state"
              label="UF"
              value={fiscal.issuerState}
              onChange={(value) => setField('issuerState', value.toUpperCase())}
              maxLength={2}
            />
            <Field
              id="issuer-zip"
              label="CEP"
              value={fiscal.issuerZip}
              onChange={(value) => setField('issuerZip', value)}
              maxLength={10}
            />
          </div>
        </section>
        <section className="fiscal-form-section">
          <h2>Destinatário</h2>
          <div className="form-grid">
            <Field
              id="recipient-name"
              label="Nome / razão social"
              value={recipient}
              onChange={setRecipient}
              required
              maxLength={120}
            />
            <Field
              id="recipient-document"
              label="CNPJ/CPF"
              value={fiscal.recipientDocument}
              onChange={(value) => setField('recipientDocument', value)}
              maxLength={18}
            />
            <Field
              id="recipient-address"
              label="Endereço completo"
              value={fiscal.recipientAddress}
              onChange={(value) => setField('recipientAddress', value)}
              maxLength={180}
            />
            <Field
              id="recipient-city"
              label="Município"
              value={fiscal.recipientCity}
              onChange={(value) => setField('recipientCity', value)}
              maxLength={80}
            />
            <Field
              id="recipient-state"
              label="UF"
              value={fiscal.recipientState}
              onChange={(value) => setField('recipientState', value.toUpperCase())}
              maxLength={2}
            />
            <Field
              id="recipient-zip"
              label="CEP"
              value={fiscal.recipientZip}
              onChange={(value) => setField('recipientZip', value)}
              maxLength={10}
            />
          </div>
        </section>
        <section className="fiscal-form-section">
          <div className="fiscal-section-heading">
            <h2>Produtos / serviços</h2>
            <button
              type="button"
              className="text-action"
              onClick={() => setField('items', [...fiscal.items, newItem()])}
              disabled={fiscal.items.length >= 30}
            >
              <Plus size={17} /> Adicionar item
            </button>
          </div>
          {fiscal.items.map((item, index) => (
            <div className="fiscal-item-form" key={index}>
              <div className="fiscal-item-heading">
                <strong>Item {index + 1}</strong>
                {fiscal.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setField(
                        'items',
                        fiscal.items.filter((_, position) => position !== index),
                      )
                    }
                    aria-label={`Remover item ${index + 1}`}
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
              <div className="form-grid">
                <Field
                  id={`item-code-${index}`}
                  label="Código"
                  value={item.code}
                  onChange={(value) => setItem(index, 'code', value)}
                  required
                  maxLength={30}
                />
                <Field
                  id={`item-desc-${index}`}
                  label="Descrição"
                  value={item.description}
                  onChange={(value) => setItem(index, 'description', value)}
                  required
                  maxLength={200}
                />
                <Field
                  id={`item-ncm-${index}`}
                  label="NCM"
                  value={item.ncm}
                  onChange={(value) => setItem(index, 'ncm', value)}
                  maxLength={8}
                />
                <Field
                  id={`item-cfop-${index}`}
                  label="CFOP"
                  value={item.cfop}
                  onChange={(value) => setItem(index, 'cfop', value)}
                  maxLength={4}
                />
                <Field
                  id={`item-cst-${index}`}
                  label="CST/CSOSN"
                  value={item.cst}
                  onChange={(value) => setItem(index, 'cst', value)}
                  maxLength={4}
                />
                <Field
                  id={`item-unit-${index}`}
                  label="Unidade"
                  value={item.unit}
                  onChange={(value) => setItem(index, 'unit', value)}
                  required
                  maxLength={6}
                />
                <Field
                  id={`item-qty-${index}`}
                  label="Quantidade"
                  value={String(item.quantity)}
                  onChange={(value) => setItem(index, 'quantity', Number(value))}
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                />
                <MoneyField
                  id={`item-price-${index}`}
                  label="Valor unitário (R$)"
                  cents={item.unitPriceCents}
                  onChange={(value) => setItem(index, 'unitPriceCents', value)}
                />
                <Field
                  id={`item-icms-${index}`}
                  label="Alíquota ICMS (%)"
                  value={String(item.icmsRate)}
                  onChange={(value) => setItem(index, 'icmsRate', Number(value))}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <Field
                  id={`item-ipi-${index}`}
                  label="Alíquota IPI (%)"
                  value={String(item.ipiRate)}
                  onChange={(value) => setItem(index, 'ipiRate', Number(value))}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>
          ))}
        </section>
        <section className="fiscal-form-section">
          <h2>Impostos e totalizadores informativos</h2>
          <p>Valores inseridos para demonstração; não há cálculo tributário oficial.</p>
          <div className="form-grid">
            <MoneyField
              id="icms-base"
              label="Base de cálculo ICMS (R$)"
              cents={fiscal.icmsBaseCents}
              onChange={(value) => setField('icmsBaseCents', value)}
            />
            <MoneyField
              id="icms-value"
              label="Valor ICMS (R$)"
              cents={fiscal.icmsCents}
              onChange={(value) => setField('icmsCents', value)}
            />
            <MoneyField
              id="ipi-value"
              label="Valor IPI (R$)"
              cents={fiscal.ipiCents}
              onChange={(value) => setField('ipiCents', value)}
            />
            <MoneyField
              id="discount"
              label="Desconto (R$)"
              cents={fiscal.discountCents}
              onChange={(value) => setField('discountCents', value)}
            />
            <MoneyField
              id="freight"
              label="Frete (R$)"
              cents={fiscal.freightCents}
              onChange={(value) => setField('freightCents', value)}
            />
            <MoneyField
              id="insurance"
              label="Seguro (R$)"
              cents={fiscal.insuranceCents}
              onChange={(value) => setField('insuranceCents', value)}
            />
            <MoneyField
              id="other"
              label="Outras despesas (R$)"
              cents={fiscal.otherCents}
              onChange={(value) => setField('otherCents', value)}
            />
          </div>
          <div className="fiscal-live-total">
            <span>Produtos: {formatMoney(productsCents)}</span>
            <strong>Total simulado: {formatMoney(totalCents)}</strong>
          </div>
        </section>
        <section className="fiscal-form-section">
          <h2>Transporte, pagamento e dados adicionais</h2>
          <div className="form-grid">
            <Field
              id="carrier"
              label="Transportador"
              value={fiscal.carrierName}
              onChange={(value) => setField('carrierName', value)}
              maxLength={120}
            />
            <Field
              id="freight-mode"
              label="Frete por conta"
              value={fiscal.freightMode}
              onChange={(value) => setField('freightMode', value)}
              maxLength={30}
            />
            <Field
              id="payment"
              label="Forma de pagamento"
              value={fiscal.paymentMethod}
              onChange={(value) => setField('paymentMethod', value)}
              maxLength={60}
            />
            <div className="field field--full">
              <label htmlFor="additional-info">Informações complementares</label>
              <textarea
                id="additional-info"
                value={fiscal.additionalInfo}
                onChange={(event) => setField('additionalInfo', event.target.value)}
                maxLength={1000}
                rows={3}
              />
            </div>
          </div>
        </section>
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
            {saving ? 'Emitindo...' : 'Gerar DANFE simulado'}
          </button>
        </div>
      </form>
    </div>
  )
}
