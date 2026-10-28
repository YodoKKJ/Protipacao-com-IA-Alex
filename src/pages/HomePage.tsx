import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, Info, Package, Plus, Search } from 'lucide-react'
import type { Loan } from '../domain/loan'
import { LoanCard } from '../components/LoanCard'

export function HomePage({ loans }: { loans: Loan[] }) {
  const openLoans = loans.filter((loan) => !loan.returnedAt)
  const [query, setQuery] = useState('')
  const visible = openLoans.filter((loan) =>
    `${loan.item} ${loan.person}`
      .toLocaleLowerCase('pt-BR')
      .includes(query.toLocaleLowerCase('pt-BR')),
  )
  return (
    <div className="page page-enter">
      <div className="topline">
        <span>Seu espaço de empréstimos</span>
        <span className="topline-date">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}
        </span>
      </div>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="hero-kicker-dot" /> Tudo em seu lugar
          </div>
          <h1 id="hero-title">
            O que é seu,
            <br />
            <em>sempre por perto.</em>
          </h1>
          <p>
            Guarde os detalhes de cada empréstimo e acompanhe o caminho de volta dos seus objetos.
          </p>
          <Link className="button button--white" to="/novo">
            <Plus size={18} aria-hidden="true" /> Novo empréstimo{' '}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-halo" />
          <div className="art-back" />
          <div className="art-book">
            <span>
              O pequeno
              <br />
              príncipe
            </span>
            <BookOpen size={32} strokeWidth={1.3} />
          </div>
          <div className="art-chip">
            <Check size={14} /> Tudo anotado
          </div>
        </div>
      </section>
      <div className="section-top">
        <div>
          <h2>
            Em aberto <span className="title-count">{openLoans.length}</span>
          </h2>
          <p>Objetos que ainda estão com outras pessoas.</p>
        </div>
        <Link to="/novo" className="text-action">
          Adicionar <Plus size={17} aria-hidden="true" />
        </Link>
      </div>
      {openLoans.length > 0 && (
        <div className="search-wrap">
          <Search size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="loan-search">
            Buscar por objeto ou pessoa
          </label>
          <input
            id="loan-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar objeto ou pessoa"
          />
        </div>
      )}
      {visible.length ? (
        <div className="loan-list">
          {visible.map((loan, index) => (
            <LoanCard key={loan.id} loan={loan} index={index} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Package size={30} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h3>{query ? 'Nada por aqui' : 'Nenhum empréstimo em aberto'}</h3>
          <p>
            {query
              ? 'Tente buscar outro objeto ou pessoa.'
              : 'Quando emprestar algo, registre aqui para lembrar de todos os detalhes.'}
          </p>
          {!query && (
            <Link to="/novo" className="button button--primary">
              <Plus size={18} aria-hidden="true" /> Registrar empréstimo
            </Link>
          )}
        </div>
      )}
      <div className="helper-line">
        <Info size={16} aria-hidden="true" /> Dados de demonstração salvos apenas neste navegador.
      </div>
    </div>
  )
}
