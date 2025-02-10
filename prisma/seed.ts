import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function seed() {
	await prisma.organization.deleteMany()
	await prisma.user.deleteMany()

	const password = await bcrypt.hash('123456', 8)

	const [user, anotherUser, anotherUserTwo] =
		await prisma.user.createManyAndReturn({
			data: [
				{
					name: 'John Doe',
					email: 'john.doe@acme.com',
					avatarUrl: 'https://github.com/alexsandrogms.png',
					password,
				},
				{
					name: faker.person.fullName(),
					email: faker.internet.email(),
					avatarUrl: faker.image.avatarGitHub(),
					password,
				},
				{
					name: faker.person.fullName(),
					email: faker.internet.email(),
					avatarUrl: faker.image.avatarGitHub(),
					password,
				},
			],
		})

	await prisma.organization.create({
		data: {
			name: 'Acme Inc (Admin)',
			domain: 'acme.com',
			slug: 'acme-admin',
			avatarUrl: faker.image.avatarGitHub(),
			shouldAttachUsersByDomain: true,
			ownerId: user.id,
			projects: {
				createMany: {
					data: [
						{
							name: faker.lorem.words(5),
							slug: faker.lorem.slug(5),
							description: faker.lorem.paragraph(),
							avatarUrl: faker.image.avatarGitHub(),
							ownerId: faker.helpers.arrayElement([
								user.id,
								anotherUser.id,
								anotherUserTwo.id,
							]),
						},
					],
				},
			},
			members: {
				createMany: {
					data: [
						{
							userId: user.id,
							role: 'ADMIN',
						},
						{
							userId: anotherUser.id,
							role: 'MEMBER',
						},
						{
							userId: anotherUserTwo.id,
							role: 'MEMBER',
						},
					],
				},
			},
		},
	})

	await prisma.organization.create({
		data: {
			name: 'Acme Inc (Member)',
			slug: 'acme-member ',
			avatarUrl: faker.image.avatarGitHub(),
			ownerId: user.id,
			projects: {
				createMany: {
					data: [
						{
							name: faker.lorem.words(5),
							slug: faker.lorem.slug(5),
							description: faker.lorem.paragraph(),
							avatarUrl: faker.image.avatarGitHub(),
							ownerId: faker.helpers.arrayElement([
								user.id,
								anotherUser.id,
								anotherUserTwo.id,
							]),
						},
					],
				},
			},
			members: {
				createMany: {
					data: [
						{
							userId: user.id,
							role: 'MEMBER',
						},
						{
							userId: anotherUser.id,
							role: 'ADMIN',
						},
						{
							userId: anotherUserTwo.id,
							role: 'MEMBER',
						},
					],
				},
			},
		},
	})

	await prisma.organization.create({
		data: {
			name: 'Acme Inc (Billing)',
			slug: 'acme-billing ',
			avatarUrl: faker.image.avatarGitHub(),
			ownerId: user.id,
			projects: {
				createMany: {
					data: [
						{
							name: faker.lorem.words(5),
							slug: faker.lorem.slug(5),
							description: faker.lorem.paragraph(),
							avatarUrl: faker.image.avatarGitHub(),
							ownerId: faker.helpers.arrayElement([
								user.id,
								anotherUser.id,
								anotherUserTwo.id,
							]),
						},
					],
				},
			},
			members: {
				createMany: {
					data: [
						{
							userId: user.id,
							role: 'BILLING',
						},
						{
							userId: anotherUser.id,
							role: 'ADMIN',
						},
						{
							userId: anotherUserTwo.id,
							role: 'MEMBER',
						},
					],
				},
			},
		},
	})
}

seed().then(() => console.log('Database seeded.'))
