import fastify from "fastify";
import { env } from "./env";

const app = fastify();

app.get("/", async () => {
  return { hello: "world " };
});

const start = async () => {
  try {
    await app.listen({ port: env.PORT });
    console.log(`🚀 Server running on ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
