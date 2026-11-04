import "server-only";

import { z } from "zod";

import { getAuth } from "./auth";
import { connectDB, MissingConfigError } from "./db";
import type { SessionUser } from "./types";

/** An error whose message is safe to show to the user. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

export function notFound(what: string): ApiError {
  return new ApiError(404, `${what} not found.`);
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

/** Runs a save, turning a unique index violation into a readable error. */
export async function failOnDuplicate<T>(
  save: () => Promise<T>,
  message: string,
  field?: string,
): Promise<T> {
  try {
    return await save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, message, field ? { [field]: message } : undefined);
    }
    throw error;
  }
}

export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<z.output<S>> {
  const body: unknown = await request.json().catch(() => {
    throw new ApiError(400, "Invalid request body.");
  });
  return parseData(body, schema);
}

export function parseData<S extends z.ZodType>(
  data: unknown,
  schema: S,
): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join(".");
    fieldErrors[field] ??= issue.message;
  }
  throw new ApiError(422, "Please check the form.", fieldErrors);
}

export function isObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

type Handler<Params> = (args: {
  request: Request;
  user: SessionUser;
  params: Params;
}) => Promise<Response>;

/**
 * Wraps every personal-data API route: rejects anyone without a valid session,
 * connects to the database and converts errors into JSON responses. Handlers
 * must scope all their queries to `user.id`.
 */
export function withUser<Params = Record<string, never>>(
  handler: Handler<Params>,
) {
  return async (
    request: Request,
    context: { params: Promise<Params> },
  ): Promise<Response> => {
    try {
      const session = await getAuth().api.getSession({
        headers: request.headers,
      });
      if (!session) throw new ApiError(401, "Please log in again.");

      await connectDB();
      const { id, name, email } = session.user;
      return await handler({
        request,
        user: { id, name, email },
        params: await context.params,
      });
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, fieldErrors: error.fieldErrors },
      { status: error.status },
    );
  }
  console.error(error);
  if (error instanceof MissingConfigError) {
    return Response.json(
      { error: "The server is not fully set up yet. See the README." },
      { status: 503 },
    );
  }
  return Response.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
