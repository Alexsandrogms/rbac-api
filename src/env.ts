import { z } from 'zod'

const nodeEnv = z.enum(['development', 'production'])

function requiredOnEnv(env: z.infer<typeof nodeEnv>) {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return (value: any) => {
		if (env === process.env.NODE_ENV && !value) {
			return false
		}

		return true
	}
}

const envSchema = z.object({
	PORT: z.coerce.number().default(3333),
	NODE_ENV: nodeEnv.default('development'),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string(),
	GITHUB_OAUTH_CLIENT_ID: z.string(),
	GITHUB_OAUTH_CLIENT_SECRET: z.string(),
	GITHUB_OAUTH_CLIENT_REDIRECT_URI: z.string(),
})

export const env = envSchema.parse(process.env)
