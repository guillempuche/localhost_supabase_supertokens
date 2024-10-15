import { load } from '@std/dotenv'
import { join } from '@std/path'

export async function loadEnvFiles(rootDir: string = Deno.cwd()) {
	const envFiles = ['.env', '.env.local']

	for (const fileName of envFiles) {
		const filePath = join(rootDir, fileName)
		try {
			const envConfig = await load({ envPath: filePath, export: true })

			for (const [key, value] of Object.entries(envConfig)) {
				if (typeof value === 'string') {
					Deno.env.set(key, value)
				}
			}
		} catch (error) {
			console.error(`Error loading ${fileName}:`, error)
		}
	}
}
