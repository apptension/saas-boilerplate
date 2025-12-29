declare module 'apollo-upload-client/UploadHttpLink.mjs' {
  import { ApolloLink } from '@apollo/client';

  interface UploadHttpLinkOptions {
    uri: string;
    headers?: Record<string, string>;
    credentials?: string;
    fetch?: typeof fetch;
    fetchOptions?: RequestInit;
  }

  export default class UploadHttpLink extends ApolloLink {
    constructor(options: UploadHttpLinkOptions);
  }
}
