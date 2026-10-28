import { NavLink } from 'react-router-dom'
import { History, Home, Plus } from 'lucide-react'

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Navegação principal">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'is-active' : ''}`}
      >
        <Home size={21} aria-hidden="true" />
        <span>Em aberto</span>
      </NavLink>
      <NavLink
        to="/novo"
        className={({ isActive }) =>
          `mobile-nav-item mobile-nav-item--new ${isActive ? 'is-active' : ''}`
        }
      >
        <span className="mobile-plus">
          <Plus size={22} aria-hidden="true" />
        </span>
        <span>Novo</span>
      </NavLink>
      <NavLink
        to="/historico"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'is-active' : ''}`}
      >
        <History size={21} aria-hidden="true" />
        <span>Histórico</span>
      </NavLink>
    </nav>
  )
}
