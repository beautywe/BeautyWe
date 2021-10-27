class BtError extends Error {
  constructor(message: string) {
    const msg = `[BeautyWe:error] ${message}`;
    super(msg);
  }
}

export default BtError;
