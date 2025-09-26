// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import ResultsTable from "@/components/ResultsTable";
import type { BenchResult } from "@/lib/bench";
import { resultsToCsv, downloadText } from "@/utils/csv";

const OPS = ["create", "read", "update", "delete"] as const;
const REGIONS = ["JP", "US", "EU"] as const;

export default function Home() {
  const [op, setOp] = useState<(typeof OPS)[number]>("read");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("JP");
  const [count, setCount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BenchResult[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/bench", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op, region, count }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "failed");
      setItems((prev) => [...prev, json.result]);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function runMatrix() {
    // JP/US/EU × 4OP を一気に走らせる簡易ユーティリティ
    (async () => {
      setLoading(true);
      const buf: BenchResult[] = [];
      try {
        for (const r of REGIONS) {
          for (const o of OPS) {
            const res = await fetch("/api/bench", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ op: o, region: r, count }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || "failed");
            buf.push(json.result);
          }
        }
        setItems((prev) => [...prev, ...buf]);
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }

  function clearAll() {
    setItems([]);
  }

  function downloadCsv() {
    const csv = resultsToCsv(items);
    downloadText(csv, `bench_results_${Date.now()}.csv`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      {/* ナビゲーションバー */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                デジタル主権実験
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-lg"
                >
                  📊 レイテンシ測定
                </Link>
                <Link
                  href="/rls"
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all duration-200"
                >
                  🔐 RLS デモ
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* モバイルメニュー */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col space-y-2 pt-4">
                <Link
                  href="/"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-lg"
                >
                  📊 レイテンシ測定
                </Link>
                <Link
                  href="/rls"
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all duration-200"
                >
                  🔐 RLS デモ
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            リージョン別レイテンシ測定
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
            Supabase 各リージョンでのCRUD操作のパフォーマンス比較
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* 設定カード */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 animate-slide-in">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
            ベンチマーク設定
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                操作（CRUD）
              </label>
              <select
                value={op}
                onChange={(e) => setOp(e.target.value as (typeof OPS)[number])}
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {OPS.map((o) => (
                  <option key={o} value={o}>
                    {o.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                リージョン
              </label>
              <select
                value={region}
                onChange={(e) =>
                  setRegion(e.target.value as (typeof REGIONS)[number])
                }
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === "JP"
                      ? "🇯🇵 日本"
                      : r === "US"
                      ? "🇺🇸 アメリカ"
                      : "🇪🇺 ヨーロッパ"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                試行回数
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* ボタン群 */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={run}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  実行中...
                </span>
              ) : (
                "この条件で実行"
              )}
            </button>

            <button
              onClick={runMatrix}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              JP/US/EU × CRUD 全実行
            </button>

            <button
              onClick={downloadCsv}
              disabled={!items.length || loading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📊 CSVダウンロード
            </button>

            <button
              onClick={clearAll}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🗑️ クリア
            </button>
          </div>
        </div>

        {/* 結果テーブル */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              測定結果
            </h2>
            {items.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                {items.length} 件の結果
              </span>
            )}
          </div>
          <ResultsTable items={items} />
        </div>

        {/* 注意事項 */}
        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl animate-fade-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.726-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                測定について
              </h3>
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                <p>
                  •
                  ブラウザ→各リージョンのSupabaseへ直接アクセスするため、ネットワーク状況で数値は揺れます。
                </p>
                <p>
                  •
                  厳密な実測を取りたい場合は、サーバーRoute（Edge/Node）で計測し、同一環境・同一回線で実行してください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
