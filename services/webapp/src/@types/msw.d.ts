/*
  DefaultRequestBody is the only type that is changed here
  We need void to be passed, because our Redux actions are often typed as voids
 */

declare module 'msw' {
  import { Mask } from 'msw/lib/types/setupWorker/glossary';
  import {
    DefaultRequestBody as DefaultRequestBodyInit,
    ResponseResolver,
    MockedRequest,
  } from 'msw/lib/types/handlers/RequestHandler';
  import { RestContext, RestHandler, RestRequest, RequestParams } from 'msw/lib/types/handlers/RestHandler';

  type DefaultRequestBody = DefaultRequestBodyInit | void;

  type Request = <
    RequestBodyType extends DefaultRequestBody = DefaultRequestBody,
    ResponseBody extends DefaultRequestBody = any,
    Params extends RequestParams = RequestParams
  >(
    mask: Mask,
    resolver: ResponseResolver<RestRequest<RequestBodyType, Params>, RestContext, ResponseBody>
  ) => RestHandler<MockedRequest<DefaultRequestBody>>;

  export declare const rest: {
    head: Request;
    get: Request;
    post: Request;
    put: Request;
    delete: Request;
    patch: Request;
    options: Request;
  };
}
