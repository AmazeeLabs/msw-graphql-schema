import 'cross-fetch/polyfill';
import { schema } from '../src/schema';
import { setupServer } from 'msw/node';
import ApolloClient, { ApolloError, gql } from 'apollo-boost';

describe('mock remote schema', () => {
  const endpoint = 'http://localhost:4000';

  it('returns "Hello World" for non-mocked fields', async (done) => {
    const server = setupServer(...(await schema(endpoint)()));
    server.listen();
    const client = new ApolloClient({ uri: endpoint });
    const result = await client.query({
      query: gql`
        {
          foo {
            bar
          }
        }
      `,
    });
    expect(result.data.foo.bar).toEqual('Hello World');
    server.close();
    done();
  });

  it('fails for a field that is not part of the schema', async (done) => {
    const server = setupServer(...(await schema(endpoint)()));
    server.listen();
    const client = new ApolloClient({ uri: endpoint, onError: () => {} });
    try {
      const result = await client
        .query({
          query: gql`
            {
              bar
            }
          `,
        })
        .then((res) => {
          console.log(res);
        });
    } catch (e) {
      if (e instanceof ApolloError) {
        expect(e.message).toEqual(
          'GraphQL error: Cannot query field "bar" on type "Query".'
        );
        done();
      }
    }
  });

  it('invokes mocked resolvers', async (done) => {
    const server = setupServer(
      ...(await schema(endpoint)({
        Foo: () => ({
          bar: 'mocked!',
        }),
      }))
    );
    server.listen();
    const client = new ApolloClient({ uri: endpoint });
    const result = await client.query({
      query: gql`
        {
          foo {
            bar
          }
        }
      `,
    });
    expect(result.data.foo.bar).toEqual('mocked!');
    server.close();
    done();
  });
});
