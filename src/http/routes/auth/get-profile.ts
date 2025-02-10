import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '@/lib/prisma'
import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getProfile(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.get(
			'/profile',
			{
				schema: {
					tags: ['Authenticate'],
					summary: 'Get authenticated user profile.',
					security: [{ bearerAuth: [] }],
					response: {
						200: z.object({
							user: z.object({
								id: z.string().uuid(),
								name: z.string().nullable(),
								email: z.string().email(),
								avatarUrl: z.string().url().nullable(),
							}),
						}),
						404: z.object({
							message: z.string(),
						}),
					},
				},
			},
			async (req, rpl) => {
				const userId = await req.getCurrentUserId()

				const user = await prisma.user.findUnique({
					where: {
						id: userId,
					},
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true,
					},
				})

				if (user === null) {
					throw new BadRequestError('User not found')
				}

				return rpl.send({ user })
			}
		)
}
