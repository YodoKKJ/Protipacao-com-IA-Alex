import type { Loan } from './loan'

/** Contrato de persistência. Uma API poderá substituir o armazenamento local. */
export interface LoanRepository {
  list(): Promise<Loan[]>
  findById(id: string): Promise<Loan | null>
  create(loan: Loan): Promise<void>
  update(loan: Loan): Promise<void>
}
