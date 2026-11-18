export interface FiscalItem {
  code: string
  description: string
  ncm: string
  cfop: string
  cst: string
  unit: string
  quantity: number
  unitPriceCents: number
  icmsRate: number
  ipiRate: number
}

export interface FiscalDraft {
  natureOperation: string
  series: string
  issuerDocument: string
  issuerStateRegistration: string
  issuerAddress: string
  issuerCity: string
  issuerState: string
  issuerZip: string
  recipientDocument: string
  recipientAddress: string
  recipientCity: string
  recipientState: string
  recipientZip: string
  items: FiscalItem[]
  freightCents: number
  insuranceCents: number
  otherCents: number
  discountCents: number
  icmsBaseCents: number
  icmsCents: number
  ipiCents: number
  carrierName: string
  freightMode: string
  paymentMethod: string
  additionalInfo: string
}

export interface FiscalDetails extends FiscalDraft {
  productsCents: number
  totalCents: number
}

export class FiscalValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FiscalValidationError'
  }
}

const moneyFields = [
  'freightCents',
  'insuranceCents',
  'otherCents',
  'discountCents',
  'icmsBaseCents',
  'icmsCents',
  'ipiCents',
] as const

function text(value: unknown, label: string, max: number, required = false): string {
  if (typeof value !== 'string') throw new FiscalValidationError(`${label} inválido.`)
  const normalized = value.trim()
  if ((required && !normalized) || normalized.length > max) {
    throw new FiscalValidationError(
      `${label} deve ter até ${max} caracteres${required ? ' e não pode ficar vazio' : ''}.`,
    )
  }
  return normalized
}

function cents(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) > 10_000_000_000) {
    throw new FiscalValidationError(`${label} inválido.`)
  }
  return value as number
}

/** Validação de formulário e aritmética demonstrativa, sem cálculo tributário oficial. */
export function prepareFiscalDetails(input: FiscalDraft): FiscalDetails {
  if (!input || typeof input !== 'object')
    throw new FiscalValidationError('Dados fiscais inválidos.')
  const fields = {
    natureOperation: text(input.natureOperation, 'Natureza da operação', 100, true),
    series: text(input.series, 'Série', 3, true),
    issuerDocument: text(input.issuerDocument, 'CNPJ/CPF do emitente', 18),
    issuerStateRegistration: text(input.issuerStateRegistration, 'Inscrição estadual', 20),
    issuerAddress: text(input.issuerAddress, 'Endereço do emitente', 180),
    issuerCity: text(input.issuerCity, 'Município do emitente', 80),
    issuerState: text(input.issuerState, 'UF do emitente', 2),
    issuerZip: text(input.issuerZip, 'CEP do emitente', 10),
    recipientDocument: text(input.recipientDocument, 'CNPJ/CPF do destinatário', 18),
    recipientAddress: text(input.recipientAddress, 'Endereço do destinatário', 180),
    recipientCity: text(input.recipientCity, 'Município do destinatário', 80),
    recipientState: text(input.recipientState, 'UF do destinatário', 2),
    recipientZip: text(input.recipientZip, 'CEP do destinatário', 10),
    carrierName: text(input.carrierName, 'Transportador', 120),
    freightMode: text(input.freightMode, 'Modalidade do frete', 30),
    paymentMethod: text(input.paymentMethod, 'Forma de pagamento', 60),
    additionalInfo: text(input.additionalInfo, 'Informações complementares', 1000),
  }
  if (!/^\d{1,3}$/.test(fields.series)) throw new FiscalValidationError('Série inválida.')
  for (const state of [fields.issuerState, fields.recipientState]) {
    if (state && !/^[A-Za-z]{2}$/.test(state)) throw new FiscalValidationError('UF inválida.')
  }
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 30) {
    throw new FiscalValidationError('Informe de 1 a 30 itens.')
  }
  const items = input.items.map((item, index) => {
    if (!item || typeof item !== 'object')
      throw new FiscalValidationError(`Item ${index + 1} inválido.`)
    const quantity = item.quantity
    if (
      typeof quantity !== 'number' ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      quantity > 1_000_000
    ) {
      throw new FiscalValidationError(`Quantidade do item ${index + 1} inválida.`)
    }
    for (const rate of [item.icmsRate, item.ipiRate]) {
      if (typeof rate !== 'number' || !Number.isFinite(rate) || rate < 0 || rate > 100) {
        throw new FiscalValidationError(`Alíquota do item ${index + 1} inválida.`)
      }
    }
    return {
      code: text(item.code, 'Código do item', 30, true),
      description: text(item.description, 'Descrição do item', 200, true),
      ncm: text(item.ncm, 'NCM', 8),
      cfop: text(item.cfop, 'CFOP', 4),
      cst: text(item.cst, 'CST/CSOSN', 4),
      unit: text(item.unit, 'Unidade', 6, true),
      quantity,
      unitPriceCents: cents(item.unitPriceCents, 'Valor unitário'),
      icmsRate: item.icmsRate,
      ipiRate: item.ipiRate,
    }
  })
  const money = Object.fromEntries(
    moneyFields.map((field) => [field, cents(input[field], field)]),
  ) as Pick<FiscalDraft, (typeof moneyFields)[number]>
  const productsCents = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPriceCents),
    0,
  )
  if (!Number.isSafeInteger(productsCents) || money.discountCents > productsCents) {
    throw new FiscalValidationError('Desconto ou total dos produtos inválido.')
  }
  const totalCents =
    productsCents -
    money.discountCents +
    money.freightCents +
    money.insuranceCents +
    money.otherCents +
    money.ipiCents
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0 || totalCents > 10_000_000_000) {
    throw new FiscalValidationError('Valor total da nota inválido.')
  }
  return { ...fields, ...money, items, productsCents, totalCents }
}
