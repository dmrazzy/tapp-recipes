import {Cradle} from '@fastify/awilix';
import {AwilixContainer} from 'awilix';
import {RouteHandlerMethod, RouteShorthandOptions} from 'fastify';
import {SiweMessage} from 'siwe';

export type Action = {
  path: string;
  method:
    | 'get'
    | 'head'
    | 'post'
    | 'put'
    | 'delete'
    | 'options'
    | 'patch'
    | 'all';
  options?: RouteShorthandOptions;
  handler: RouteHandlerMethod;
};

export type Controller = {
  prefix: string;
  actions: Action[];
};

type HttpMethodLimited = 'get' | 'post' | 'put' | 'delete';

export type SecurityFilterRule = {
  pattern: RegExp;
  httpMethod?: HttpMethodLimited | HttpMethodLimited[];
};

export type JobHandler = (
  diContainer: AwilixContainer<Cradle>,
  fireDate: Date
) => void | Promise<any>;

declare module 'fastify' {
  interface Session {
    siwe?: {
      nonce?: string;
      message?: SiweMessage;
    };
  }

  interface FastifyRequest {
    user?: {
      name: string;
      loginMethod: string;
      loginInfo: any;
    };
  }
}
