class BtError extends Error {
    constructor(message) {
        const _msg = `[BeautyWe:error] ${message}`;
        super(_msg);
    }
}

export default BtError;
