import bcrypt from 'bcryptjs'
import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '@/lib/prisma'
import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithPassword(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/sessions/password',
		{
			schema: {
				tags: ['Authenticate'],
				summary: 'Authenticate with e=mail &  password.',
				body: z.object({
					email: z.string().email(),
					password: z.string().min(6),
				}),
				response: {
					201: z.object({
						token: z.string(),
					}),
					400: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (req, rpl) => {
			const { email, password } = req.body

			const userFromEmail = await prisma.user.findUnique({
				where: { email },
			})

			if (userFromEmail === null) {
				throw new BadRequestError('Invalid credentials.')
			}

			if (userFromEmail.password === null) {
				throw new BadRequestError(
					'User does not have a password, use social login.'
				)
			}

			const isPasswordValid = await bcrypt.compare(
				password,
				userFromEmail.password
			)

			if (!isPasswordValid) {
				throw new BadRequestError('Invalid credentials.')
			}

			const token = await rpl.jwtSign(
				{
					sub: userFromEmail.id,
				},
				{
					sign: {
						expiresIn: '7d',
					},
				}
			)

			return rpl.status(201).send({ token })
		}
	)
}
