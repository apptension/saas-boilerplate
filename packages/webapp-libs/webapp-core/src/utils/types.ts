export type UnknownObject = Record<string, unknown>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<unknown> ? T[P] : DeepPartial<T[P]>;
};

export type ArrayOrSingle<T> = T | T[];
