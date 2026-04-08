/**
 * Tipos da layer base
 */

/** Item de navegação */
export interface NavItem {
  title: string
  path: string
  icon?: string
}

/** Grupo de navegação */
export interface NavGroup<T extends NavItem = NavItem> {
  title: string
  items: T[]
}

/** Opções do composable useSeoPage */
export interface SeoPageOptions {
  title: string
  description?: string
  path?: string
  ogImage?: string
}
