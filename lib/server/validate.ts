/**
 * Minimal server-side validation for data crossing into the FastAPI bridge.
 *
 * Watermelon's API defines credentials as `{ username, password }` with no length
 * or character constraints, so this only guards the types and rejects empty or
 * obviously abusive input. It deliberately does not add policy that the backend
 * does not have.
 */
export type Credentials = {
  username: string;
  password: string;
};

const MAX_USERNAME_LENGTH = 64;
const MAX_PASSWORD_LENGTH = 512;

export function parseCredentials(body: unknown): Credentials | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { username, password } = body as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return null;
  }

  const trimmed = username.trim();
  if (!trimmed || !password) {
    return null;
  }
  if (trimmed.length > MAX_USERNAME_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return null;
  }

  return { username: trimmed, password };
}
