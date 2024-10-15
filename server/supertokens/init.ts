import supertokens from 'supertokens-node'
import Passwordless from 'supertokens-node/recipe/passwordless'
import { SMTPService } from 'supertokens-node/recipe/passwordless/emaildelivery'
import Session from 'supertokens-node/recipe/session'

const smtpSettings = {
	host: Deno.env.get('SMTP_HOST') || '',
	password: Deno.env.get('SMTP_PASSWORD') || '',
	port: Number(Deno.env.get('SMTP_PORT')) || 2500,
	from: {
		name: 'Explorer SL',
		email: 'no-reply@example.com',
	},
	secure: false,
}

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
				emailDelivery: { service: new SMTPService({ smtpSettings }) },
				flowType: 'USER_INPUT_CODE_AND_MAGIC_LINK',
				contactMethod: 'EMAIL',
			}),
			Session.init({
				cookieSecure: true, // Ensures cookies are only sent over HTTPS
				cookieSameSite: 'lax', // Helps prevent CSRF attacks
				exposeAccessTokenToFrontendInCookieBasedAuth: true,
				// Optionally, specify the cookie domain if needed
				// cookieDomain: Deno.env.get("COOKIE_DOMAIN") || "",
			}),
		],
		debug: true,
	})
}

export { supertokens, initSuperTokens }
