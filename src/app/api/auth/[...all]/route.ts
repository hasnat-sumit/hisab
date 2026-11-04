import { toNextJsHandler } from "better-auth/next-js";

import { errorResponse } from "@/lib/api";
import { getAuth } from "@/lib/auth";

async function handle(request: Request): Promise<Response> {
  try {
    return await getAuth().handler(request);
  } catch (error) {
    const response = errorResponse(error);
    const { error: message } = (await response.json()) as { error: string };
    // Better Auth's client reads failures from a `message` field.
    return Response.json({ message }, { status: response.status });
  }
}

export const { GET, POST } = toNextJsHandler(handle);
