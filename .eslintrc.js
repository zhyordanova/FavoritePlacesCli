module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/*'],
            message:
              'Use relative imports for consistency in this project (../ or ../../).',
          },
        ],
      },
    ],
  },
};
