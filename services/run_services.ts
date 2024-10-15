import { green, red, yellow } from '@std/fmt/colors'
import { join } from '@std/path'

export const services = [
	'services/supabase',
	'services/email',
	'services/supertokens',
]

async function runDockerCompose(directory: string) {
	console.log(`Starting ${directory}...`)

	const process = new Deno.Command('docker', {
		args: ['compose', '-f', join(directory, 'docker-compose.yml'), 'up', '-d'], // Start Docker with docker-compose file in the directory
		stdout: 'piped',
		stderr: 'piped',
	})

	const { code, stdout, stderr } = await process.output()

	if (code === 0) {
		console.log(`${green('Successfully started')} ${directory}`)
		console.log(new TextDecoder().decode(stdout)) // Convert stdout to string
	} else {
		console.error(`${red('Error starting')} ${directory}`)
		console.error(new TextDecoder().decode(stderr)) // Convert stderr to string
	}

	// Wait for containers to be in a running state
	await waitForContainers(directory)
}

async function waitForContainers(directory: string) {
	while (true) {
		const process = new Deno.Command('docker', {
			args: [
				'compose',
				'-f',
				join(directory, 'docker-compose.yml'),
				'ps',
				'--format',
				'{{.Name}},{{.State}}',
			],
			stdout: 'piped',
		})

		const { code, stdout } = await process.output()

		if (code === 0) {
			const output = new TextDecoder().decode(stdout)
			const containerStates = output
				.trim()
				.split('\n')
				.map(line => {
					const [name, state] = line.split(',')
					return { name, state }
				})

			if (containerStates.every(container => container.state === 'running')) {
				console.log(`${green('All containers are running for')} ${directory}`)
				break
			}
			console.log(
				`${yellow('Waiting for containers to start in')} ${directory}`,
			)
			for (const container of containerStates) {
				console.log(`  ${container.name}: ${container.state}`)
			}
		} else {
			console.error(
				`${red('Error checking container status for')} ${directory}`,
			)
		}

		await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds before checking again
	}
}

async function checkServicesHealth() {
	console.log('Checking health of all services...')

	const process = new Deno.Command('docker', {
		args: ['ps', '--format', '{{.Names}},{{.Status}}'],
		stdout: 'piped',
	})

	const { code, stdout } = await process.output()

	if (code === 0) {
		const output = new TextDecoder().decode(stdout)
		const lines = output.trim().split('\n')

		for (const line of lines) {
			const [name, status] = line.split(',')

			if (status.includes('healthy')) {
				console.log(`${green('✓')} ${name} is healthy`)
			} else if (status.includes('unhealthy')) {
				console.log(`${red('✗')} ${name} is unhealthy`)
			} else {
				console.log(`${yellow('?')} ${name} health unknown (${status})`)
			}
		}
	} else {
		console.error(red('Failed to check services health'))
	}
}

async function startAllServices() {
	for (const service of services) {
		await runDockerCompose(service)
	}
}

if (import.meta.main) {
	await startAllServices()
	await checkServicesHealth()
	console.log(
		green('All services started. Check the health status above for details.'),
	)
}
