import { NavLink } from 'react-router-dom'
import { History, Home, Sparkles } from 'lucide-react'
import { Brand } from './Brand'

export function Sidebar({ openCount }: { openCount: number }) {
  return (
    <aside className="sidebar">
      <Brand />
      <p className="sidebar-label">Seu espaço</p>
      <nav className="side-nav" aria-label="Navegação principal">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
        >
          <Home size={19} aria-hidden="true" /> Em aberto{' '}
          <span className="nav-count">{openCount}</span>
        </NavLink>
        <NavLink
          to="/historico"
          className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
        >
          <History size={19} aria-hidden="true" /> Histórico
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <Sparkles size={18} aria-hidden="true" />
          <p>Um lugar tranquilo para lembrar de tudo que você compartilhou.</p>
        </div>
        <span className="demo-tag">
          <span /> Versão de demonstração
        </span>
      </div>
    </aside>
  )
}
