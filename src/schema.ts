import { ApolloServer, IMocks } from 'apollo-server';
import {
  MockedRequest,
  ResponseResolver,
  ResponseTransformer,
  rest,
} from 'msw';
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import 'cross-fetch/polyfill';

import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
} from 'graphql';

const schemas: {
  [key: string]: {
    mocks: IMocks;
    schema: GraphQLSchema;
  };
} = {};

export const schema = (endpoint: string) => {
  return async (mockedResolvers: IMocks = {}) => {
    const result = await new ApolloClient({
      uri: endpoint,
    }).query({
      query: gql(getIntrospectionQuery()),
    });

    schemas[endpoint] = {
      mocks: mockedResolvers,
      schema: buildClientSchema(result.data),
    };
    const handler: ResponseResolver<
      MockedRequest,
      {
        json: (body: Record<string, any>) => ResponseTransformer;
      }
    > = async (req, res, ctx) => {
      const result = await new ApolloServer({
        schema: schemas[endpoint].schema,
        mocks: schemas[endpoint].mocks,
        introspection: true,
      }).executeOperation(req.body as { query: string; variables: object });
      return res(ctx.json(result));
    };
    return [rest.get(endpoint, handler), rest.post(endpoint, handler)];
  };
};
