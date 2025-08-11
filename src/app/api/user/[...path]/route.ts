import { NextRequest } from "next/server";
import { env } from "@/utils/env";
import { forward } from "@/lib/api/proxy";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return forward(req, env.user, "/api/v1", resolvedParams.path);
}
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
