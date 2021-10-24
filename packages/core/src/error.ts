class BtError extends Error {
  constructor(message) {
    const msg = `[BeautyWe:error] ${message}`;
    super(msg);
  }
}

export default BtError;
