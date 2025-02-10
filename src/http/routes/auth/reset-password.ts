import bcrypt from 'bcryptjs'
import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '@/lib/prisma'
import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function resetPassword(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.post(
			'/password/reset',
			{
				schema: {
					tags: ['Authenticate'],
					summary: 'Get authenticated user profile.',
					body: z.object({
						code: z.string(),
						password: z.string().min(6),
					}),
					response: {
						204: z.null(),
					},
				},
			},
			async (req, rpl) => {
				const { code, password } = req.body

				const tokenFromCode = await prisma.token.findUnique({
					where: { id: code },
				})

				if (tokenFromCode === null) {
					throw new UnauthorizedError()
				}

				const passwordHash = await bcrypt.hash(password, 8)

				await prisma.user.update({
					where: { id: tokenFromCode.userId },
					data: { password: passwordHash },
				})

				return rpl.status(204).send()
			}
		)
}
