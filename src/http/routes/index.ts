import fastifySwaggerUI from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'

import { createAccount } from './auth/create-account'
import { authenticateWithPassword } from './auth/authenticate-with-password'
import { getProfile } from './auth/get-profile'
import { requestPasswordRecover } from './auth/request-password-recover'
import { resetPassword } from './auth/reset-password'
import { authenticateWithGithub } from './auth/authenticate-with-github'

export async function routes(app: FastifyInstance) {
	app.register(fastifySwaggerUI, {
		routePrefix: '/docs',
	})

	app.register(createAccount)
	app.register(authenticateWithPassword)
	app.register(authenticateWithGithub)
	app.register(getProfile)
	app.register(requestPasswordRecover)
	app.register(resetPassword)
}
