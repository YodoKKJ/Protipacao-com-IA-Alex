import { useEffect, useRef, useState } from 'react'
import { LoanService } from '../domain/LoanService'
import type { Loan, LoanDraft } from '../domain/loan'
import { BrowserLoanRepository } from '../infrastructure/BrowserLoanRepository'

export function useLoans() {
  const repositoryRef = useRef<BrowserLoanRepository | null>(null)
  if (!repositoryRef.current) {
    repositoryRef.current = new BrowserLoanRepository(window.localStorage)
  }
  const repository = repositoryRef.current
  const serviceRef = useRef<LoanService | null>(null)
  if (!serviceRef.current) serviceRef.current = new LoanService(repository)
  const service = serviceRef.current

  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true
    service
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
  }, [service])

  async function createLoan(draft: LoanDraft): Promise<string> {
    const loan = await service.create(draft)
    setLoans(await service.list())
    return loan.id
  }

  async function updateLoan(id: string, draft: LoanDraft): Promise<void> {
    await service.update(id, draft)
    setLoans(await service.list())
  }

  async function returnLoan(id: string): Promise<void> {
    await service.markReturned(id)
    setLoans(await service.list())
  }

  async function resetDemo(): Promise<void> {
    await repository.resetDemo()
    setLoans(await service.list())
  }

  return { loans, loading, loadError, createLoan, updateLoan, returnLoan, resetDemo }
}
