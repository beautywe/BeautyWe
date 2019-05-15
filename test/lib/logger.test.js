import test from 'ava';
import logger from '../../src/lib/logger';

test('use logger', (t) => {
    t.notThrows(() => {
        logger.warn('test');
        logger.info('test');
        logger.error('test');
        logger.debug('test');
    });
});
