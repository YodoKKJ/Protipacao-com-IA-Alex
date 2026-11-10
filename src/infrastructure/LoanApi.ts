import type { Loan, LoanDraft } from '../domain/loan'
import { api } from './api'

/** Cliente de transporte. IDs e validações definitivas pertencem ao servidor. */
export class LoanApi {
  async list(): Promise<Loan[]> {
    return (await api<{ loans: Loan[] }>('/loans')).loans
  }

  async create(draft: LoanDraft): Promise<Loan> {
    return (await api<{ loan: Loan }>('/loans', { method: 'POST', body: JSON.stringify(draft) }))
      .loan
  }

  async update(id: string, draft: LoanDraft): Promise<Loan> {
    return (
      await api<{ loan: Loan }>(`/loans/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(draft),
      })
    ).loan
  }

  async markReturned(id: string): Promise<Loan> {
    return (
      await api<{ loan: Loan }>(`/loans/${encodeURIComponent(id)}/return`, {
        method: 'POST',
      })
    ).loan
  }
}
