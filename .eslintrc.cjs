module.exports = {
  root: true,
  extends: ['@antfu'],
  rules: {
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'vue/script-setup-uses-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      // we are only using this rule to check for unused arguments since TS
      // catches unused variables but not args.
      { varsIgnorePattern: '.*', args: 'none' },
    ],
  },
}
