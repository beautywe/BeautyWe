import { Logger } from '@jerryc/mini-logger';

export { Level } from '@jerryc/mini-logger';
export const logger = new Logger({ prefix: 'beautywe-middleware-queue' });
export default logger;
