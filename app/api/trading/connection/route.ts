import { forwardTradingRequest } from "@/lib/trading/edge-proxy";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return forwardTradingRequest(request, "connection"); }
export async function POST(request: Request) { return forwardTradingRequest(request, "connection"); }
export async function DELETE(request: Request) { return forwardTradingRequest(request, "connection"); }
