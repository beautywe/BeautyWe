import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: 'packages',
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      // Relative path from the folder where jest.config.js is located
      astTransformers: { before: ['ts-jest-keys-transformer.js'] },
    },
  },
};

export default config;
