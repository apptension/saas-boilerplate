type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<unknown> ? T[P] : DeepPartial<T[P]>;
};

export type Factory<T> = (overrides?: Partial<T>) => T;

export type DeepMergeFactory<T> = (overrides?: DeepPartial<T>) => T;
