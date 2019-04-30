class Logger {
    constructor({ prefix } = {}) {
        this.prefix = prefix;
    }

    warn(...args) {
        return console.warn(`[${this.prefix}:waring]`, ...args);
    }

    info(...args) {
        return console.info(`[${this.prefix}:info]`, ...args);
    }

    error(...args) {
        return console.error(`[${this.prefix}:error]`, ...args);
    }

    debug(...args) {
        return console.debug(`[${this.prefix}:debug]`, ...args);
    }
}

const logger = new Logger({ prefix: 'BeautyWe' });

export {
    logger,
    Logger,
};

export default logger;
