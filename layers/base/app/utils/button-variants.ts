import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

/**
 * Button variants com suporte a ícones SVG e Nuxt Icon (Iconify).
 *
 * Nuxt Icon renderiza como <span class="iconify">, não <svg>,
 * por isso usamos [&_:is(svg,.iconify)] para estilizar ambos.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_:is(svg,.iconify)]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_:is(svg,.iconify)]:transition-colors [&_:is(svg,.iconify)]:duration-200 shrink-0 [&_:is(svg,.iconify)]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-base-0 hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        // Variantes da marca - Primário (Design System Figma)
        'brand-outline':
          'rounded-full border border-primary-900 text-secondary-900 [&_:is(svg,.iconify)]:text-primary-900 bg-transparent hover:bg-primary-900 hover:text-base-0 hover:border-primary-900 hover:[&_:is(svg,.iconify)]:text-base-0 disabled:opacity-100 disabled:bg-base-100 disabled:text-base-400 disabled:border-base-200 disabled:[&_:is(svg,.iconify)]:text-base-400',
        // Variantes da marca - Secundário (Design System Figma)
        'secondary-soft':
          'rounded-full bg-secondary-50 border border-secondary-100 text-secondary-900 [&_:is(svg,.iconify)]:text-primary-900 hover:bg-secondary-900 hover:text-base-0 hover:border-secondary-900 hover:[&_:is(svg,.iconify)]:text-base-0 disabled:opacity-100 disabled:bg-base-100 disabled:text-base-400 disabled:border-base-200 disabled:[&_:is(svg,.iconify)]:text-base-400'
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
        // Tamanhos da marca (medidas shadcn-vue + estilo rounded)
        'brand-sm': 'h-8 px-3 gap-1.5 has-[>svg]:px-2.5 rounded-full',
        'brand-md': 'h-9 px-4 has-[>svg]:px-3 rounded-full',
        'brand-lg': 'h-10 px-6 has-[>svg]:px-4 rounded-full',
        'brand-xl': 'h-14 px-6 text-xl has-[>svg]:px-4 rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
