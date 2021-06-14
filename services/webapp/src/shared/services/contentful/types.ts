export * from './__generated/types';

export type ContentfulPlain<T> = Omit<T, 'sys' | 'contentfulMetadata'>;
