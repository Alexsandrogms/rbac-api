import { z } from 'zod'
import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '@/lib/prisma'
import { BadRequestError } from '../_errors/bad-request-error'

export async function createAccount(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/users',
		{
			schema: {
				tags: ['Authenticate'],
				summary: 'Create a new account.',
				body: z.object({
					name: z.string(),
					email: z.string().email(),
					password: z.string().min(6),
				}),
			},
		},
		async (req, rpl) => {
			const { name, email, password } = req.body

			const userWithSameEmail = await prisma.user.findUnique({
				where: { email },
			})

			if (userWithSameEmail) {
				throw new BadRequestError('user same email already exists.')
			}

			const [, domain] = email.split('@')

			const autoJoinOrganization = await prisma.organization.findFirst({
				where: {
					domain,
					shouldAttachUsersByDomain: true,
				},
			})

			const passwordHash = await bcrypt.hash(password, 8)

			await prisma.user.create({
				data: {
					name,
					email,
					password: passwordHash,
					member_on: autoJoinOrganization
						? {
								create: {
									organizationId: autoJoinOrganization.id,
								},
							}
						: undefined,
				},
			})

			return rpl.status(201).send()
		}
	)
}
