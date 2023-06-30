import fastify from 'fastify'

import { env } from './env'
import fastifyCookie from '@fastify/cookie'
import { routes } from './http/routes'

export const app = fastify()

app.register(fastifyCookie)
app.register(routes)

const start = async () => {
  try {
    await app.listen({ port: env.PORT })
    console.log(`🚀 Server running on ${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
