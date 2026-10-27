export type Loan = {
  id: string
  item: string
  person: string
  lentAt: string
  dueAt: string
  note: string
  returnedAt: string | null
}

export const seedLoans: Loan[] = [
  {
    id: 'livro-pequeno-principe',
    item: 'O pequeno príncipe',
    person: 'Ana',
    lentAt: '2026-10-12',
    dueAt: '',
    note: 'Edição de capa dura.',
    returnedAt: null,
  },
  {
    id: 'furadeira',
    item: 'Furadeira',
    person: 'Bruno',
    lentAt: '2026-10-18',
    dueAt: '2026-11-02',
    note: 'Com a maleta e duas brocas.',
    returnedAt: null,
  },
  {
    id: 'camera',
    item: 'Câmera instantânea',
    person: 'Lia',
    lentAt: '2026-09-08',
    dueAt: '',
    note: '',
    returnedAt: '2026-09-15',
  },
]

const STORAGE_KEY = 'emprestaai-demo-v1'

export function loadLoans(): Loan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedLoans
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as Loan[] : seedLoans
  } catch {
    return seedLoans
  }
}

export function saveLoans(loans: Loan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))
}

export function formatDate(value: string) {
  if (!value) return 'Não definida'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day))
}

export function shortDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(year, month - 1, day))
}

export function getItemKind(item: string): 'book' | 'tool' | 'camera' | 'other' {
  const normalized = item.toLocaleLowerCase('pt-BR')
  if (/livro|príncipe|revista|quadrinho/.test(normalized)) return 'book'
  if (/furadeira|ferramenta|martelo|chave/.test(normalized)) return 'tool'
  if (/câmera|camera|foto/.test(normalized)) return 'camera'
  return 'other'
}
