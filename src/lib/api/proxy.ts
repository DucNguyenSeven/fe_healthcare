import { NextRequest } from 'next/server';

// Helper function để forward request tới service khác (dùng trong Next Route Handler)
export async function forward(
  req: NextRequest,
  baseUrl: string,
  prefix: string,
  pathParts: string[]
) {
  const target = `${baseUrl}${prefix.replace(/\/$/, "")}/${pathParts.join("/")}${new URL(req.url).search}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  
  const headers: Record<string, string> = { 
    accept: req.headers.get("accept") ?? "application/json" 
  };
  
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  
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
      signal: controller.signal 
    });
    
    const resBody = await res.arrayBuffer();
    
    return new Response(resBody, { 
      status: res.status, 
      headers: { 
        "content-type": res.headers.get("content-type") ?? "application/json" 
      } 
    });
  } finally {
    clearTimeout(timeout);
  }
}
