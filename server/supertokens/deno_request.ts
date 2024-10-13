import { BaseRequest } from "supertokens-node/lib/build/framework/request";
import type { HTTPMethod } from "supertokens-node/lib/build/types";

export class DenoRequest extends BaseRequest {
	private request: Request;
	private url: URL;

	constructor(request: Request) {
		super();
		this.original = request;
		this.request = request;
		this.url = new URL(request.url);
	}

	protected async getJSONFromRequestBody(): Promise<any> {
		const contentType = this.request.headers.get("content-type");
		if (contentType?.includes("application/json")) {
			try {
				return await this.request.json();
			} catch {
				return undefined;
			}
		}
		return undefined;
	}

	protected async getFormDataFromRequestBody(): Promise<any> {
		const contentType = this.request.headers.get("content-type");
		if (contentType?.includes("application/x-www-form-urlencoded")) {
			const formData = await this.request.formData();
			const data: Record<string, string> = {};
			for (const [key, value] of formData.entries()) {
				if (typeof value === "string") {
					data[key] = value;
				}
			}
			return data;
		}
		return undefined;
	}

	getKeyValueFromQuery(key: string): string | undefined {
		return this.url.searchParams.get(key) ?? undefined;
	}

	getMethod(): HTTPMethod {
		return this.request.method.toUpperCase() as HTTPMethod;
	}

	getCookieValue(key: string): string | undefined {
		const cookieHeader = this.request.headers.get("cookie");
		if (!cookieHeader) return undefined;
		const cookies = cookieHeader.split(";").map((c) => c.trim());
		for (const cookie of cookies) {
			const [cookieKey, ...cookieVal] = cookie.split("=");
			if (cookieKey === key) {
				return cookieVal.join("=");
			}
		}
		return undefined;
	}

	getHeaderValue(key: string): string | undefined {
		return this.request.headers.get(key) ?? undefined;
	}

	getOriginalURL(): string {
		return this.request.url;
	}
}
