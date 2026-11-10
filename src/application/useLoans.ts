import { useEffect, useState } from 'react'
import type { Loan, LoanDraft } from '../domain/loan'
import { LoanApi } from '../infrastructure/LoanApi'

const loanApi = new LoanApi()

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true
    loanApi
      .list()
      .then((items) => {
        if (active) setLoans(items)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function createLoan(draft: LoanDraft): Promise<string> {
    const loan = await loanApi.create(draft)
    setLoans(await loanApi.list())
    return loan.id
  }

  async function updateLoan(id: string, draft: LoanDraft): Promise<void> {
    await loanApi.update(id, draft)
    setLoans(await loanApi.list())
  }

  async function returnLoan(id: string): Promise<void> {
    await loanApi.markReturned(id)
    setLoans(await loanApi.list())
  }

  return { loans, loading, loadError, createLoan, updateLoan, returnLoan }
}
