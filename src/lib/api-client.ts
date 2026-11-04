import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Calls one of our API routes and throws a readable error if it fails. */
export async function apiFetch(
  url: string,
  options: { method?: string; body?: unknown } = {},
): Promise<void> {
  const { method = "POST", body } = options;
  const isForm = body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body && !isForm ? { "Content-Type": "application/json" } : {},
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError("Could not reach the server. Check your connection.");
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      fieldErrors?: Record<string, string>;
    };
    throw new ApiRequestError(
      data.error ?? "Something went wrong. Please try again.",
      data.fieldErrors,
    );
  }
}

/** Shows an API error on its form fields, or as a toast if it has none. */
export function showFormError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): void {
  const fieldErrors = error instanceof ApiRequestError && error.fieldErrors;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    for (const [field, message] of Object.entries(fieldErrors)) {
      setError(field as Path<T>, { message });
    }
    return;
  }
  toast.error(error instanceof Error ? error.message : "Something went wrong.");
}
