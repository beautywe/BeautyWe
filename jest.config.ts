import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: 'packages',
  preset: 'ts-jest',
  testEnvironment: 'node',
};

export default config;
