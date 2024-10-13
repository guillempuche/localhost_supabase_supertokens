import type { Framework } from "supertokens-node/lib/build/framework/types.ts";

import { DenoRequest } from "./deno_request.ts";
import { DenoResponse } from "./deno_response.ts";

const DenoWrapper: Framework = {
	wrapRequest: (unwrapped: Request) => {
		return new DenoRequest(unwrapped);
	},
	wrapResponse: () => {
		return new DenoResponse();
	},
};

export const plugin = DenoWrapper.plugin;
export const wrapRequest = DenoWrapper.wrapRequest;
export const wrapResponse = DenoWrapper.wrapResponse;
