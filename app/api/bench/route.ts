// app/api/bench/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runBenchmark } from "@/lib/bench";

export async function POST(req: NextRequest) {
  try {
    const { op, region, count } = await req.json();
    const result = await runBenchmark(
      op,
      region,
      Math.max(1, Math.min(200, Number(count) || 50))
    );
    return NextResponse.json({ ok: true, result });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
