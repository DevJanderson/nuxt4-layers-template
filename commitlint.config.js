// Commitlint - Validação de mensagens de commit
// https://commitlint.js.org/

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nova funcionalidade
        'fix', // Correção de bug
        'docs', // Documentação
        'style', // Formatação (sem mudança de código)
        'refactor', // Refatoração
        'perf', // Melhoria de performance
        'test', // Adição/correção de testes
        'chore', // Tarefas de manutenção
        'ci', // Mudanças em CI/CD
        'build', // Mudanças em build
        'revert' // Reverter commit
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100]
  }
}
