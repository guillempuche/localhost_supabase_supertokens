import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { StatusCode } from "hono/utils/http-status";
import { BaseRequest, BaseResponse } from "supertokens-node/framework";

export class HonoRequest extends BaseRequest {
	private ctx: Context;

	constructor(ctx: Context) {
		super();
		this.ctx = ctx;
	}

	getKeyValueFromQuery(key: string): string | undefined {
		return this.ctx.req.query(key);
	}

	getMethod(): string {
		return this.ctx.req.method;
	}

	getCookieValue(key: string): string | undefined {
		const cookies = getCookie(this.ctx);
		return cookies[key];
	}

	getHeaderValue(key: string): string | undefined {
		const value = this.ctx.req.raw.headers.get(key);
		return value ?? undefined;
	}

	getOriginalURL(): string {
		return this.ctx.req.url;
	}

	async getFormData(): Promise<any> {
		return await this.ctx.req.parseBody();
	}

	async getJSONBody(): Promise<any> {
		return await this.ctx.req.json();
	}
}

export class HonoResponse extends BaseResponse {
	private ctx: Context;

	constructor(ctx: Context) {
		super();
		this.ctx = ctx;
	}

	setHeader(key: string, value: string, allowDuplicateKey: boolean) {
		if (allowDuplicateKey) {
			this.ctx.res.headers.append(key, value);
		} else {
			this.ctx.res.headers.set(key, value);
		}
	}

	removeHeader(key: string) {
		this.ctx.res.headers.delete(key);
	}

	setCookie(
		key: string,
		value: string,
		domain: string | undefined,
		secure: boolean,
		httpOnly: boolean,
		expires: number,
		path: string,
		sameSite: "strict" | "lax" | "none",
	) {
		setCookie(this.ctx, key, value, {
			domain,
			secure,
			httpOnly,
			expires: new Date(expires),
			path,
			sameSite,
		});
	}

	setStatusCode(statusCode: number) {
		// this.ctx.res.status(statusCode);
		this.ctx.status(statusCode as StatusCode);
	}

	sendJSONResponse(content: any) {
		// this.ctx.res.json(content);
		this.ctx.json(content);
	}

	sendHTMLResponse(html: string) {
		// this.ctx.res.html(html);
		this.ctx.html(html);
	}
}
