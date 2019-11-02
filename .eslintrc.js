module.exports = {
  parser: "babel-eslint",

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },

  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],

  globals: {
    describe: true,
    it: true,
    before: true,
    beforeEach: true,
    after: true,
    afterEach: true,
  },

  rules: {
    'func-call-spacing': ['off'],
    'no-spaced-func': ['off'],
    'no-unexpected-multiline': ['off'],
    'no-underscore-dangle': ['error', {
      allow: ["__"], /* Ramda’s R.__ */
    }]
  },
};
