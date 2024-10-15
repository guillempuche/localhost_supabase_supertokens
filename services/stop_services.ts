// services/stop_services.ts

import { green, red } from '@std/fmt/colors'
import { join } from '@std/path'

import { services } from './run_services.ts'

async function stopDockerCompose(directory: string) {
	console.log(`Stopping ${directory}...`)
	const process = new Deno.Command('docker', {
		args: ['compose', '-f', join(directory, 'docker-compose.yml'), 'down'],
		stdout: 'piped',
		stderr: 'piped',
	})

	const { code, stdout, stderr } = await process.output()

	if (code === 0) {
		console.log(`${green('Successfully stopped')} ${directory}`)
		console.log(new TextDecoder().decode(stdout))
	} else {
		console.error(`${red('Error stopping')} ${directory}`)
		console.error(new TextDecoder().decode(stderr))
	}

	// Wait for containers to be fully stopped
	await waitForContainersToStop(directory)
}

async function waitForContainersToStop(directory: string) {
	while (true) {
		const process = new Deno.Command('docker', {
			args: [
				'compose',
				'-f',
				join(directory, 'docker-compose.yml'),
				'ps',
				'--quiet',
			],
			stdout: 'piped',
		})

		const { code, stdout } = await process.output()

		if (code === 0) {
			const output = new TextDecoder().decode(stdout).trim()
			if (output === '') {
				console.log(`${green('All containers are stopped for')} ${directory}`)
				break
			}
		}

		await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds before checking again
	}
}

async function stopAllServices() {
	for (const service of services) {
		await stopDockerCompose(service)
	}
}

if (import.meta.main) {
	await stopAllServices()
	console.log(green('All services stopped successfully.'))
}
