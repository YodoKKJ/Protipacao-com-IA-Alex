import type { LoanRepository } from '../domain/LoanRepository'
import type { Loan } from '../domain/loan'
import { demoLoans } from './demoLoans'

const STORAGE_KEY = 'emprestaai-demo-v1'

function isLoan(value: unknown): value is Loan {
  if (!value || typeof value !== 'object') return false
  const loan = value as Record<string, unknown>
  return (
    typeof loan.id === 'string' &&
    typeof loan.item === 'string' &&
    typeof loan.person === 'string' &&
    typeof loan.lentAt === 'string' &&
    typeof loan.dueAt === 'string' &&
    typeof loan.note === 'string' &&
    (loan.returnedAt === null || typeof loan.returnedAt === 'string')
  )
}

export class BrowserLoanRepository implements LoanRepository {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'>) {}

  async list(): Promise<Loan[]> {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (!raw) return [...demoLoans]
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.every(isLoan) ? parsed : [...demoLoans]
    } catch {
      return [...demoLoans]
    }
  }

  async findById(id: string): Promise<Loan | null> {
    return (await this.list()).find((loan) => loan.id === id) ?? null
  }

  async create(loan: Loan): Promise<void> {
    this.write([loan, ...(await this.list())])
  }

  async update(updated: Loan): Promise<void> {
    const loans = await this.list()
    this.write(loans.map((loan) => (loan.id === updated.id ? updated : loan)))
  }

  async resetDemo(): Promise<void> {
    this.write(demoLoans)
  }

  private write(loans: Loan[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(loans))
  }
}
