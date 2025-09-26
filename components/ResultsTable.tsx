// components/ResultsTable.tsx
"use client";

import type { BenchResult } from "@/lib/bench";

export default function ResultsTable({ items }: { items: BenchResult[] }) {
  if (!items.length) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-slate-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          測定結果がありません
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          ベンチマークを実行して結果を表示してください
        </p>
      </div>
    );
  }

  const getOperationColor = (op: string) => {
    switch (op) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "read":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "update":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case "JP":
        return "🇯🇵";
      case "US":
        return "🇺🇸";
      case "EU":
        return "🇪🇺";
      default:
        return "🌍";
    }
  };

  const getPerformanceColor = (ms: number) => {
    if (ms < 100) return "text-green-600 dark:text-green-400";
    if (ms < 300) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {[
                "#",
                "操作",
                "リージョン",
                "試行回数",
                "平均 (ms)",
                "P95 (ms)",
              ].map((header, index) => (
                <th
                  key={header}
                  className={`px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                    index === 0 ? "w-16" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {items.map((result, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOperationColor(
                      result.op
                    )}`}
                  >
                    {result.op.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getRegionFlag(result.region)}
                    </span>
                    <span className="font-medium">{result.region}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  <div className="flex items-center">
                    <span className="font-mono font-medium">
                      {result.count}
                    </span>
                    <span className="ml-1 text-slate-500 dark:text-slate-400">
                      回
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span
                      className={`font-mono font-semibold ${getPerformanceColor(
                        result.avg_ms
                      )}`}
                    >
                      {result.avg_ms.toFixed(2)}
                    </span>
                    <span className="ml-1 text-slate-500 dark:text-slate-400">
                      ms
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span
                      className={`font-mono font-semibold ${getPerformanceColor(
                        result.p95_ms
                      )}`}
                    >
                      {result.p95_ms.toFixed(2)}
                    </span>
                    <span className="ml-1 text-slate-500 dark:text-slate-400">
                      ms
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
