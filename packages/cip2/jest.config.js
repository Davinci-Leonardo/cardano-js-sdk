module.exports = {
  setupFilesAfterEnv: ['./test/jest.setup.js'],
  preset: 'ts-jest',
  transform: {
    "^.+\\.test.ts?$": "ts-jest"
  },
  coveragePathIgnorePatterns: ['\.config\.js'],
  testTimeout: process.env.CI ? 120000 : 12000,
}
