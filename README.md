# Mock Service Worker: GraphQL Schema

Mock remote GraphQL schemas using [Mock Service Worker](https://mswjs.io/) and [Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started/).

Example:
```typescript
import {setupServer} from 'msw/node';
import {schema} from 'msw-graphql-schema';
const server = setupServer(...(await schema('http://my.graphql.schema')({
  Foo: () => ({
    bar: 'baz'
  })
})))';
```
