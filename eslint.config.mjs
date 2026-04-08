// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  { ignores: ['generated/**'] },
  {
    rules: {
      // Vue
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'always', component: 'always' }
        }
      ],

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],

      // Geral
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['~/layers/base/app/*', '~/layers/base/app/**/*'],
              message:
                'Use auto-import ou #shared em vez de importar diretamente de ~/layers/base/app/'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['tests/unit/**/*.test.ts'],
    rules: {
      'no-restricted-imports': 'off'
    }
  }
)
