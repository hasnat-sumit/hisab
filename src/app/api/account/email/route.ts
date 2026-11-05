import { APIError } from "better-auth/api";

import { ApiError, failOnDuplicate, parseBody, withUser } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { changeEmailSchema } from "@/lib/validators";

const TAKEN = "Another account already uses this email.";

// Not Better Auth's own /change-email: without a mail service it reports success
// when the address is already taken, and leaves the account unchanged.
export const POST = withUser(async ({ request, user }) => {
  const { newEmail, currentPassword } = await parseBody(
    request,
    changeEmailSchema,
  );
  const auth = getAuth();

  try {
    await auth.api.verifyPassword({
      headers: request.headers,
      body: { password: currentPassword },
    });
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "INVALID_PASSWORD") {
      const message = "That is not your current password.";
      throw new ApiError(422, message, { currentPassword: message });
    }
    throw error;
  }

  if (newEmail === user.email.toLowerCase()) {
    const message = "This is already your email.";
    throw new ApiError(422, message, { newEmail: message });
  }
  const { internalAdapter } = await auth.$context;
  if (await internalAdapter.findUserByEmail(newEmail)) {
    throw new ApiError(409, TAKEN, { newEmail: TAKEN });
  }

  // The app sends no email, so nothing has proved the new address is theirs.
  await failOnDuplicate(
    () =>
      internalAdapter.updateUser(user.id, {
        email: newEmail,
        emailVerified: false,
      }),
    TAKEN,
    "newEmail",
  );
  return new Response(null, { status: 204 });
});
