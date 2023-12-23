import { handleAuthCallback } from "@/lib/google/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return handleAuthCallback(request);
}
