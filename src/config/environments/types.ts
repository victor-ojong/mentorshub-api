export type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

export enum Environment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}
