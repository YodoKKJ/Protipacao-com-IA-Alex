import { BookOpen, Camera, Package, Wrench } from 'lucide-react'
import { getItemKind } from '../loanPresentation'

const kindIcons = { book: BookOpen, tool: Wrench, camera: Camera, other: Package }

export function ItemVisual({ item, large = false }: { item: string; large?: boolean }) {
  const kind = getItemKind(item)
  const Icon = kindIcons[kind]
  return (
    <span
      className={`item-visual item-visual--${kind} ${large ? 'item-visual--large' : ''}`}
      aria-hidden="true"
    >
      <Icon strokeWidth={1.6} />
    </span>
  )
}
