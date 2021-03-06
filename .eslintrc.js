module.exports = {
  extends: [
    '@losant/eslint-config-losant/env/browser',
    'plugin:flowtype/recommended',
  ],
  plugins: [
    'flowtype',
  ],
  rules: {
    'arrow-body-style': 'off',
  },
  overrides: [
    {
      files: ['src/**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
};
