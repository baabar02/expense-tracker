import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers/index";

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  
const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT) || 8000 },
  context: async ({ req }) => {
    const token = req.headers.authorization || "";
   // console.log("context token:", token);
    return { token };
  },
});


  console.log(`Server running at ${url}`);
};

startServer();
