export enum ErrorCodes {
  FILE_TOO_LARGE = 'file-too-large',
  FILE_TOO_SMALL = 'file-too-small',
  TOO_MANY_FILES = 'too-many-files',
  FILE_INVALID_TYPE = 'file-invalid-type',
  GENERIC = 'generic',
}

export type ErrorMessageGenerator = (file: File) => string;

export type ErrorMessagesRecord = Record<ErrorCodes | string, ErrorMessageGenerator>;
