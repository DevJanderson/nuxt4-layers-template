/**
 * Example Form Composable
 * Lógica reutilizável para formulários do módulo
 */

import type { CreateExampleData } from './types'
import { validateCreateExample } from './useExampleValidators'

export function useExampleForm() {
  const form = ref<CreateExampleData>({
    name: '',
    description: ''
  })

  const errors = ref<Record<string, string>>({})
  const isSubmitting = ref(false)

  // Usa o validator real para consistência
  const isValid = computed(() => {
    const result = validateCreateExample(form.value.name, form.value.description)
    return result.isValid
  })

  function validate(): boolean {
    const result = validateCreateExample(
      form.value.name,
      form.value.description
    )
    errors.value = result.errors
    return result.isValid
  }

  function reset() {
    form.value = { name: '', description: '' }
    errors.value = {}
    isSubmitting.value = false
  }

  return {
    form,
    errors,
    isValid,
    isSubmitting,
    validate,
    reset
  }
}
