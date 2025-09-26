// /lib/bench.ts
import { clients } from "./supabaseClients";
import type { RegionKey } from "@/types/supabase";

export type CrudOp = "create" | "read" | "update" | "delete";
export type BenchResult = {
  op: CrudOp;
  region: RegionKey;
  count: number;
  avg_ms: number;
  p95_ms: number;
  raw: number[];
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function benchOnce(op: CrudOp, region: RegionKey): Promise<number> {
  const supa = clients[region];
  const t0 = performance.now();

  if (op === "create") {
    const { error } = await supa.from("records_bench").insert({
      content: `hello-${Math.random().toString(36).slice(2)}`,
      region,
    });
    if (error) throw error;
  }

  if (op === "read") {
    // 型が効くので data[0]?.id も安全に扱える
    const { error } = await supa.from("records_bench").select("*").limit(1);
    if (error) throw error;
  }

  if (op === "update") {
    const { data, error } = await supa
      .from("records_bench")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;

    let id = data?.[0]?.id as string | undefined;
    if (!id) {
      const { data: ins, error: insErr } = await supa
        .from("records_bench")
        .insert({ content: "seed", region })
        .select("id")
        .single();
      if (insErr) throw insErr;
      id = ins.id;
    }

    const { error: updErr } = await supa
      .from("records_bench")
      .update({ content: "updated" })
      .eq("id", id);
    if (updErr) throw updErr;
  }

  if (op === "delete") {
    const { data, error } = await supa
      .from("records_bench")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;

    const id = data?.[0]?.id as string | undefined;
    if (id) {
      const { error: delErr } = await supa
        .from("records_bench")
        .delete()
        .eq("id", id);
      if (delErr) throw delErr;
    }
  }

  const t1 = performance.now();
  return t1 - t0;
}

export async function runBenchmark(
  op: CrudOp,
  region: RegionKey,
  count: number
): Promise<BenchResult> {
  const samples: number[] = [];
  for (let i = 0; i < count; i++) {
    samples.push(await benchOnce(op, region));
    await sleep(20);
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const p95 = sorted[Math.max(0, Math.floor(samples.length * 0.95) - 1)];
  return {
    op,
    region,
    count,
    avg_ms: Math.round(avg * 10) / 10,
    p95_ms: Math.round(p95 * 10) / 10,
    raw: samples,
  };
}
