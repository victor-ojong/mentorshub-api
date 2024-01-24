module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest', // Allows the use of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    options: {
      project: './tsconfig.json',
    },
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'eslint-config-prettier',
  ], // Uses the linting rules from @typescript-eslint/eslint-plugin
  plugins: ['@typescript-eslint', 'prettier', 'eslint-plugin-prettier', 'jest'],
  env: {
    node: true, // Enable Node.js global variables
  },
  rules: {
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
      },
    ],

    '@typescript-eslint/no-unused-vars': 'error',
  },
};
