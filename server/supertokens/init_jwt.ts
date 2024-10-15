import { SignJWT } from 'jose'
import supertokens from 'supertokens-node'
import Passwordless from 'supertokens-node/recipe/passwordless'
import Session from 'supertokens-node/recipe/session'

function initSuperTokens() {
	supertokens.init({
		supertokens: {
			apiKey: Deno.env.get('SUPERTOKENS_API_KEY') || '',
			connectionURI: Deno.env.get('SUPERTOKENS_URL') || '',
		},
		appInfo: {
			appName: 'Researcher',
			apiDomain: Deno.env.get('SERVER_URL') || '',
			websiteDomain: Deno.env.get('WEBSITE_URL') || '',
			// apiBasePath: "/api",
			websiteBasePath: '/auth',
		},
		// framework: "custom",
		// It contains all the modules that you want to use from SuperTokens. More here: https://supertokens.com/docs/guides
		recipeList: [
			Passwordless.init({
				flowType: 'USER_INPUT_CODE_AND_MAGIC_LINK',
				contactMethod: 'EMAIL',
			}),
			Session.init({
				override: {
					functions: originalImplementation => {
						return {
							...originalImplementation,
							exposeAccessTokenToFrontendInCookieBasedAuth: true,
							// We want to create a JWT which contains the users userId signed with Supabase's secret so
							// it can be used by Supabase to validate the user when retrieving user data from their service.
							// We store this token in the accessTokenPayload so it can be accessed on the frontend and on the backend.

							createNewSession: async input => {
								const payload = {
									userId: input.userId,
									explorerId: input.userContext.explorerId,
									exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
								}

								const secretKey = new TextEncoder().encode(
									Deno.env.get('SUPABASE_JWT_SECRET') || '',
								)
								const supabase_jwt_token = await new SignJWT(payload)
									.setProtectedHeader({ alg: 'HS256' })
									.sign(secretKey)

								input.accessTokenPayload = {
									...input.accessTokenPayload,
									supabase_token: supabase_jwt_token,
								}

								return await originalImplementation.createNewSession(input)
							},
						}
					},
				},
			}),
		],
		debug: true,
	})
}

export { supertokens, initSuperTokens }
