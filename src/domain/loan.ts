export interface Loan {
  id: string
  item: string
  person: string
  lentAt: string
  dueAt: string
  note: string
  returnedAt: string | null
}

export type LoanDraft = Pick<Loan, 'item' | 'person' | 'lentAt' | 'dueAt' | 'note'>

export function todayISO(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function isLoanOverdue(loan: Loan, date = todayISO()): boolean {
  return !loan.returnedAt && Boolean(loan.dueAt) && loan.dueAt < date
}
