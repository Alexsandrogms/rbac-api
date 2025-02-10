import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '@/lib/prisma'
import { auth } from '@/http/middlewares/auth'

export async function requestPasswordRecover(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.post(
			'/password/recover',
			{
				schema: {
					tags: ['Authenticate'],
					summary: 'Get authenticated user profile.',
					body: z.object({
						email: z.string().email(),
					}),
					response: {
						201: z.null(),
					},
				},
			},
			async (req, rpl) => {
				const { email } = req.body

				const userFromEmail = await prisma.user.findUnique({
					where: { email },
				})

				if (userFromEmail === null) {
					return rpl.status(201).send()
				}

				const { id: code } = await prisma.token.create({
					data: {
						type: 'PASSWORD_RECOVER',
						userId: userFromEmail.id,
					},
				})

				console.log(code)

				return rpl.status(201).send()
			}
		)
}
