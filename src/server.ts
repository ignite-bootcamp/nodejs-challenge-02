import fastify from "fastify";

import { env } from "./env";
import { mealsRoutes } from "./routes/meals";
import fastifyCookie from "@fastify/cookie";

export const app = fastify();

app.register(fastifyCookie);
app.register(mealsRoutes, { prefix: "meals" });

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
