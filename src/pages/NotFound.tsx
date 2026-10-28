import { Link } from 'react-router-dom'
import { PageTitle } from '../components/PageTitle'

export function NotFound() {
  return (
    <div className="page page-enter">
      <PageTitle backTo="/" description="Este empréstimo não foi encontrado nesta demonstração.">
        Não encontramos esse objeto.
      </PageTitle>
      <Link to="/" className="button button--primary">
        Voltar ao início
      </Link>
    </div>
  )
}
