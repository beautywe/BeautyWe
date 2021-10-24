export type NextFn = () => any;
export type Middleware = (context: any, next?: NextFn) => Promise<any>;
