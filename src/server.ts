import fastify from "fastify";

const app = fastify();

app.get("/", async () => {
  return { hello: "world " };
});

const start = async () => {
  try {
    await app.listen({ port: 3333 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
