import { NextRequest } from "next/server";

/**
 * Generic BFF forwarder.
 * - baseUrl: service root (e.g., http://localhost:8081)
 * - prefix: service api prefix (e.g., "/api/v1" or "/api/ai-chat")
 * - pathParts: catch-all path segments from route
 * - Forwards minimal safe headers and preserves content-type
 * - Supports JSON and multipart/form-data transparently
 * - 10s timeout
 * - If cookie "access_token" exists, forwards as Authorization: Bearer <token>
 */
export async function forward(
  req: NextRequest,
  baseUrl: string,
  prefix: string,
  pathParts: string[]
) {
  const prefixClean = prefix.replace(/\/$/, "");
  const joined = pathParts.join("/");
  const url = new URL(req.url);
  const target = `${baseUrl}${prefixClean}/${joined}${url.search}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  const token = req.cookies.get("access_token")?.value;
  const headers: Record<string, string> = {
    accept: req.headers.get("accept") ?? "application/json",
  };
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  if (token) headers["authorization"] = `Bearer ${token}`;

  try {
    const bodyNeeded = !["GET", "HEAD"].includes(req.method);
    const body = bodyNeeded ? await req.arrayBuffer() : undefined;

    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const resContentType = res.headers.get("content-type") ?? "application/json";
    const resBody = await res.arrayBuffer();
    return new Response(resBody, {
      status: res.status,
      headers: { "content-type": resContentType },
    });
  } finally {
    clearTimeout(timeout);
  }
}
