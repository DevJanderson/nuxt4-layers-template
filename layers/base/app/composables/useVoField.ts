/**
 * Composable para conectar Value Objects a campos de formulário.
 *
 * Usa a função tryCreate do VO para validação reativa.
 * Compatível com qualquer VO que tenha tryCreate retornando Result.
 *
 * @example
 * const email = ref('')
 * const { isValid, error, value } = useVoField(email, tryCreateEmail)
 *
 * // No template:
 * // <input v-model="email" />
 * // <span v-if="error">{{ error }}</span>
 */

import type { Result } from '#shared/domain/result'

export function useVoField<T>(
  input: Ref<string> | ComputedRef<string>,
  factory: (value: string) => Result<T>
) {
  const result = computed(() => factory(toValue(input)))

  return {
    isValid: computed(() => result.value.ok),
    error: computed(() => (result.value.ok ? null : result.value.error)),
    value: computed(() => (result.value.ok ? result.value.value : null))
  }
}
