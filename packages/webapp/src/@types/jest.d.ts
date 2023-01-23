export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveOperation(operationName: string): R;
      toHaveLatestOperation(operationName: string): R;
      toLatestOperationInputEqual(input: Record<string, string | File>): R;
    }
  }
}
