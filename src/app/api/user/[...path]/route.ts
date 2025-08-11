import { NextRequest } from "next/server";
import { env } from "@/utils/env";
import { forward } from "@/lib/api/proxy";

function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, env.user, "/api/v1", params.path);
}
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
