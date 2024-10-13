import { load } from "@std/dotenv";
import { walk } from "@std/fs";

export async function loadEnvFiles(rootDir: string = Deno.cwd()) {
	const envFiles = [".env", ".env.local"];

	for await (const entry of walk(rootDir, { maxDepth: 2 })) {
		if (entry.isFile && envFiles.includes(entry.name)) {
			const envConfig = await load({
				envPath: entry.path,
				export: true,
			});

			for (const [key, value] of Object.entries(envConfig)) {
				console.log(key, value);
				if (typeof value === "string") {
					Deno.env.set(key, value);
				}
			}
		}
	}
}
