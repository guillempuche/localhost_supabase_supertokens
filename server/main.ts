import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { green } from '@std/fmt/colors'
import {
	createDevice,
	createExplorer,
	createTopic,
	deleteDevice,
	deleteExplorer,
	deleteTopic,
	getAllDevices,
	getAllExplorers,
	getAllTopics,
	getDevice,
	getExplorer,
	getSessions,
	getTopic,
	initDatabase,
	updateDevice,
	updateExplorer,
	updateTopic,
} from './api.ts'
import { loadEnvFiles } from './dotenv.ts'
import { middleware } from './middleware_v4.ts'
import { initSuperTokens, supertokens } from './supertokens/index.ts'

async function startServer() {
	console.log('Starting server initialization...')

	// Load environment variables first
	await loadEnvFiles('./server')

	await initDatabase()

	initSuperTokens()

	const app = new Hono()

	app.use('*', logger())

	// Health check route
	app.get('/health', async c => {
		return c.json({ status: 'healthy' }, 200)
	})

	// Expose all the APIs from SuperTokens to the client, and add the session
	// to the request object if one exists
	// Apply CORS and auth middleware to all routes except /health
	app.use('*', async (c, next) => {
		if (c.req.path !== '/health') {
			// Apply CORS middleware
			await cors({
				origin: Deno.env.get('WEBSITE_URL') ?? 'http://localhost:3000',
				allowHeaders: ['Content-Type', ...supertokens.getAllCORSHeaders()],
				credentials: true,
			})(c, next)

			// Apply auth middleware
			await middleware()(c, next)
		} else {
			await next()
		}
	})

	// Create a sub-app for the API routes
	const api = new Hono()

	// Explorers routes
	api.get('/explorers', getAllExplorers)
	api.get('/explorers/:id', getExplorer)
	api.post('/explorers', createExplorer)
	api.put('/explorers/:id', updateExplorer)
	api.delete('/explorers/:id', deleteExplorer)

	// Topics routes
	api.get('/topics', getAllTopics)
	api.get('/topics/:id', getTopic)
	api.post('/topics', createTopic)
	api.put('/topics/:id', updateTopic)
	api.delete('/topics/:id', deleteTopic)

	// Devices routes
	api.get('/devices', getAllDevices)
	api.get('/devices/:id', getDevice)
	api.post('/devices', createDevice)
	api.put('/devices/:id', updateDevice)
	api.delete('/devices/:id', deleteDevice)

	// Sessions route
	api.get('/sessions', getSessions)

	// Define API routes
	app.route('/api', api)

	// Error handling
	app.onError((err, c) => {
		console.error('An error occurred:', err)
		return c.text('Internal Server Error', 500)
	})

	// Fallback route for unrecognized paths
	app.all('*', c => c.text('Not Found', 404))

	// Start the server
	Deno.serve(
		{
			port: Number(Deno.env.get('SERVER_PORT')) || 5000,
			hostname: Deno.env.get('SERVER_HOSTNAME') || '127.0.0.1',
			onListen({ hostname, port }) {
				console.log(green(`Server started at http://${hostname}:${port}`))
			},
		},
		app.fetch,
	)
}

startServer().catch(error => {
	console.error('Failed to start server:', error)
})
