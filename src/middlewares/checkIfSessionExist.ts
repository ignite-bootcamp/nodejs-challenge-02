import { FastifyReply, FastifyRequest } from 'fastify'

export function checkIfSessionExist(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.cookies.userId

  if (!userId) {
    reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
