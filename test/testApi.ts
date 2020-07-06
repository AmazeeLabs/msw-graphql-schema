import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';

const typeDefs = gql`
  type Foo {
    bar: String!
  }

  type Query {
    foo: Foo!
  }
`;
const resolvers = {
  Query: {
    foo: () => ({
      bar: 'baz',
    }),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
app.get('/test', (req, res) => {
  res.statusCode = 200;
  res.send('OK');
});
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () => {
  console.log(`🚀  Server ready at http://localhost:4000`);
});
