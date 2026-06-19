import { supabaseAdmin } from "@/lib/supabaseAdmin";

export class UserContextAuthError extends Error {
  status: 401 | 403;

  constructor(message: string, status: 401 | 403 = 401) {
    super(message);
    this.name = "UserContextAuthError";
    this.status = status;
  }
}

function bearerToken(req: Request) {
  const value = req.headers.get("authorization") || "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function parseSessionValue(value: string) {
  try {
    let decoded = decodeURIComponent(value);

    if (decoded.startsWith("base64-")) {
      decoded = Buffer.from(decoded.slice(7), "base64url").toString("utf8");
    }

    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return parsed[0] || null;
    return parsed?.access_token || parsed?.accessToken || null;
  } catch {
    return null;
  }
}

function cookieAccessToken(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader
    .split(";")
    .map((part) => {
      const separator = part.indexOf("=");
      if (separator < 0) return null;

      return {
        name: part.slice(0, separator).trim(),
        value: part.slice(separator + 1).trim(),
      };
    })
    .filter(Boolean) as Array<{ name: string; value: string }>;

  for (const { name, value } of cookies) {
    if (!name || !value) continue;

    if (name === "sb-access-token" || name === "supabase-auth-token") {
      return parseSessionValue(value) || decodeURIComponent(value);
    }

    if (/^sb-.*-auth-token$/.test(name)) {
      const token = parseSessionValue(value);
      if (token) return token;
    }
  }

  const chunkGroups = new Map<string, Array<{ index: number; value: string }>>();
  for (const { name, value } of cookies) {
    const match = name.match(/^(sb-.*-auth-token)\.(\d+)$/);
    if (!match) continue;

    const group = chunkGroups.get(match[1]) || [];
    group.push({ index: Number(match[2]), value });
    chunkGroups.set(match[1], group);
  }

  for (const chunks of chunkGroups.values()) {
    const value = chunks
      .sort((left, right) => left.index - right.index)
      .map((chunk) => chunk.value)
      .join("");
    const token = parseSessionValue(value);
    if (token) return token;
  }

  return null;
}

export function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === "development";
}

export function hasValidWorkerOverride(req: Request) {
  const allowedSecrets = [
    process.env.WORKER_SECRET,
    process.env.CRON_SECRET,
  ].filter(Boolean) as string[];
  if (!allowedSecrets.length) return false;

  const url = new URL(req.url);
  const authorization = req.headers.get("authorization") || "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const provided =
    req.headers.get("x-worker-secret") ||
    req.headers.get("x-ghostme-worker-secret") ||
    url.searchParams.get("token") ||
    bearer;

  return Boolean(provided && allowedSecrets.includes(provided));
}

export function requireWorkerRequest(req: Request) {
  if (!process.env.WORKER_SECRET && !process.env.CRON_SECRET) {
    throw new UserContextAuthError("Worker secret non configurato", 403);
  }

  if (!hasValidWorkerOverride(req)) {
    throw new UserContextAuthError("Worker non autorizzato", 401);
  }
}

export function requireDevelopmentOrWorker(req: Request) {
  if (!isDevelopmentEnvironment() && !hasValidWorkerOverride(req)) {
    throw new UserContextAuthError("Endpoint interno non autorizzato", 401);
  }
}

export async function getAuthenticatedUserId(
  req: Request,
  requestedUserId?: string | null
) {
  const accessToken = bearerToken(req) || cookieAccessToken(req);

  if (accessToken) {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    const authenticatedUserId = data.user?.id || null;

    if (!error && authenticatedUserId) {
      if (requestedUserId && requestedUserId !== authenticatedUserId) {
        throw new UserContextAuthError("User context non autorizzato", 403);
      }

      return authenticatedUserId;
    }
  }

  const manualOverrideAllowed =
    isDevelopmentEnvironment() || hasValidWorkerOverride(req);

  if (manualOverrideAllowed && requestedUserId) {
    return requestedUserId;
  }

  throw new UserContextAuthError("Autenticazione richiesta", 401);
}
