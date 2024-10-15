/**
 * Copied from https://github.com/supertokens/supertokens-node/blob/1896eabb0aac587f8b5f7a9bede8cc4b0a17a229/examples/cloudflare-workers/with-email-password-hono-be-only/middleware.ts
 */

import { serialize } from 'cookie'
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import {
	CollectingResponse,
	PreParsedRequest,
	middleware as customMiddleware,
} from 'supertokens-node/framework/custom'
import Session from 'supertokens-node/recipe/session'
import type { HTTPMethod } from 'supertokens-node/types'

function setCookiesInHeaders(
	headers: Headers,
	cookies: CollectingResponse['cookies'],
) {
	for (const cookie of cookies) {
		headers.append(
			'Set-Cookie',
			serialize(cookie.key, cookie.value, {
				domain: cookie.domain,
				expires: new Date(cookie.expires),
				httpOnly: cookie.httpOnly,
				path: cookie.path,
				sameSite: cookie.sameSite,
				secure: cookie.secure,
			}),
		)
	}
}

function copyHeaders(source: Headers, destination: Headers): void {
	for (const [key, value] of source.entries()) {
		destination.append(key, value)
	}
}

export const middleware = () => {
	return async (c: Context, next: Next) => {
		const request = new PreParsedRequest({
			method: c.req.method as HTTPMethod,
			url: c.req.url,
			query: Object.fromEntries(new URL(c.req.url).searchParams.entries()),
			cookies: getCookie(c),
			headers: c.req.raw.headers,
			getFormBody: () => c.req.parseBody(),
			getJSONBody: () => c.req.json(),
		})
		const baseResponse = new CollectingResponse()

		const stMiddleware = customMiddleware(() => request)

		const { handled, error } = await stMiddleware(request, baseResponse)

		if (error) {
			throw error
		}

		if (handled) {
			setCookiesInHeaders(baseResponse.headers, baseResponse.cookies)
			return new Response(baseResponse.body, {
				status: baseResponse.statusCode,
				headers: baseResponse.headers,
			})
		}

		// Add session to c.req if it exists
		try {
			c.req.session = await Session.getSession(request, baseResponse, {
				sessionRequired: false,
			})

			await next()

			// Add cookies that were set by `getSession` to response
			setCookiesInHeaders(c.res.headers, baseResponse.cookies)
			// Copy headers that were set by `getSession` to response
			copyHeaders(baseResponse.headers, c.res.headers)
			return c.res
		} catch (err) {
			if (Session.Error.isErrorFromSuperTokens(err)) {
				if (
					err.type === Session.Error.TRY_REFRESH_TOKEN ||
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
