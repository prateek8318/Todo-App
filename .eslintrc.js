module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'prettier/prettier': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-inline-styles': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
