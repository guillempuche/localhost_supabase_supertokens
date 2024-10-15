import type { Context, Next } from 'hono'
import Session from 'supertokens-node/recipe/session'

import { HonoRequest, HonoResponse } from './hono.ts'

export const verifySession = (options?: { sessionRequired?: boolean }) => {
	return async (c: Context, next: Next) => {
		const req = new HonoRequest(c)
		const res = new HonoResponse(c)

		try {
			const session = await Session.getSession(req, res, options)

			// Attach session to the context's request object
			c.req.session = session

			await next()
		} catch (err) {
			if (Session.Error.isErrorFromSuperTokens(err)) {
				if (
					err.type === Session.Error.TRY_REFRESH_TOKEN ||
					err.type === Session.Error.UNAUTHORISED ||
					err.type === Session.Error.INVALID_CLAIMS
				) {
					return c.text(
						'Unauthorized',
						err.type === Session.Error.INVALID_CLAIMS ? 403 : 401,
					)
				}
			}
			throw err
		}
	}
}
