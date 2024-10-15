import { BaseResponse } from 'supertokens-node/lib/build/framework/response'

export class DenoResponse extends BaseResponse {
	public statusCode: number
	public headers: Headers
	public cookies: string[]
	public body: any

	constructor() {
		super()
		this.original = {}
		this.statusCode = 200
		this.headers = new Headers()
		this.cookies = []
		this.body = null
	}

	setHeader(key: string, value: string, allowDuplicateKey: boolean): void {
		if (allowDuplicateKey) {
			this.headers.append(key, value)
		} else {
			this.headers.set(key, value)
		}
	}

	removeHeader(key: string): void {
		this.headers.delete(key)
	}

	setCookie(
		key: string,
		value: string,
		domain: string | undefined,
		secure: boolean,
		httpOnly: boolean,
		expires: number,
		path: string,
		sameSite: 'strict' | 'lax' | 'none',
	): void {
		let cookieStr = `${key}=${value}`
		if (domain) cookieStr += `; Domain=${domain}`
		if (path) cookieStr += `; Path=${path}`
		if (expires) {
			const expiresDate = new Date(expires)
			cookieStr += `; Expires=${expiresDate.toUTCString()}`
		}
		if (httpOnly) cookieStr += '; HttpOnly'
		if (secure) cookieStr += '; Secure'
		if (sameSite) cookieStr += `; SameSite=${sameSite}`
		this.cookies.push(cookieStr)
	}

	setStatusCode(statusCode: number): void {
		this.statusCode = statusCode
	}

	sendJSONResponse(content: any): void {
		this.body = JSON.stringify(content)
		this.headers.set('Content-Type', 'application/json')
	}

	sendHTMLResponse(html: string): void {
		this.body = html
		this.headers.set('Content-Type', 'text/html')
	}
}
