import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as ActionCard } from './ActionCard.vue'

export const actionCardVariants = cva(
  'flex items-start overflow-clip transition-all duration-200',
  {
    variants: {
      variant: {
        outline:
          'bg-base-0 border border-secondary-100 hover:bg-primary-50 hover:border-primary-100',
        elevated:
          'bg-base-0 border border-secondary-100 shadow-md shadow-secondary-950/10 hover:bg-primary-50 hover:border-primary-100'
      },
      size: {
        medium: 'rounded-[12px]',
        large: 'rounded-[16px]'
      }
    },
    compoundVariants: [
      { variant: ['outline', 'elevated'], size: 'medium', class: 'p-4' },
      { variant: ['outline', 'elevated'], size: 'large', class: 'p-6' }
    ],
    defaultVariants: {
      variant: 'outline',
      size: 'medium'
    }
  }
)

export type ActionCardVariants = VariantProps<typeof actionCardVariants>
