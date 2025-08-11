import { NextRequest } from "next/server";

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

  const headers: Record<string, string> = {
    accept: req.headers.get("accept") ?? "application/json",
  };
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  
  // Forward cookies for authentication
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) headers["cookie"] = cookieHeader;

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
