export function formatDate(value: string): string {
  if (!value) return 'Não definida'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export function shortDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
    new Date(year, month - 1, day),
  )
}

export function getItemKind(item: string): 'book' | 'tool' | 'camera' | 'other' {
  const normalized = item.toLocaleLowerCase('pt-BR')
  if (/livro|príncipe|revista|quadrinho/.test(normalized)) return 'book'
  if (/furadeira|ferramenta|martelo|chave/.test(normalized)) return 'tool'
  if (/câmera|camera|foto/.test(normalized)) return 'camera'
  return 'other'
}
