export type NextFn = () => any;
export type Middleware<Context> = (context: Context, next?: NextFn) => Promise<any>;
