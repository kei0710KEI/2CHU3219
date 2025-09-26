"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// JP/US どちらでも使えますが、まずは RLS を設定した JP に接続してテスト
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL_JP!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_JP!;
const supa = createClient<Database>(URL, KEY, {
  auth: { persistSession: true },
});

export default function RlsDemoPage() {
  const [email, setEmail] = useState("");
  const [sessionUser, setSessionUser] = useState<null | {
    id: string;
    email?: string;
    country?: string;
  }>(null);
  const [log, setLog] = useState<string[]>([]);
  const [myCountry, setMyCountry] = useState<"JP" | "US" | "EU">("JP");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function push(msg: string) {
    setLog((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev]);
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supa.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      setSessionUser(
        user
          ? {
              id: user.id,
              email: user.email || undefined,
              country: (user.user_metadata as { country?: string })?.country,
            }
          : null
      );
    });
    // 初回も反映
    supa.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setSessionUser(
        user
          ? {
              id: user.id,
              email: user.email || undefined,
              country: (user.user_metadata as { country?: string })?.country,
            }
          : null
      );
    });
    return () => subscription.unsubscribe();
  }, []);

  async function sendMagicLink() {
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });
    if (error) {
      alert(error.message);
      return;
    }
    alert("メールを送信しました。届いたリンクから戻ってきてください。");
  }

  async function setCountryOnServer() {
    if (!sessionUser?.id) {
      alert("ログインしてください");
      return;
    }
    const res = await fetch("/api/admin/set-country", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: sessionUser.id, country: myCountry }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error || "failed");
      return;
    }
    push(`country を ${myCountry} に設定しました（JWTを更新します）`);

    // ★ 追記：JWTを即時更新（これがポイント）
    await supa.auth.refreshSession();

    // 画面の表示を最新に
    const { data } = await supa.auth.getSession();
    const user = data.session?.user;
    setSessionUser(
      user
        ? {
            id: user.id,
            email: user.email || undefined,
            country: (user.user_metadata as { country?: string })?.country,
          }
        : null
    );
  }

  async function insertRow(country: "JP" | "US" | "EU") {
    const { error } = await supa.from("records_rls").insert({
      content: `note-${Math.random().toString(36).slice(2)}`,
      country,
    });
    if (error) push(`INSERT country=${country} -> 拒否 (${error.message})`);
    else push(`INSERT country=${country} -> 許可`);
  }

  async function readRows() {
    const { data, error } = await supa
      .from("records_rls")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) push(`SELECT -> 拒否 (${error.message})`);
    else push(`SELECT -> 許可（${data?.length ?? 0}件）`);
  }

  async function signOut() {
    await supa.auth.signOut();
    setSessionUser(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900">
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
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all duration-200"
                >
                  📊 レイテンシ測定
                </Link>
                <Link
                  href="/rls"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium shadow-lg"
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
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all duration-200"
                >
                  📊 レイテンシ測定
                </Link>
                <Link
                  href="/rls"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium shadow-lg"
                >
                  🔐 RLS デモ
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            RLS デモ
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
            Row Level Security - 自国データのみ許可
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
        </div>

        {/* ログインセクション */}
        {!sessionUser && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 animate-slide-in">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                1. ログイン（Magic Link）
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  メールアドレス
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <button
                onClick={sendMagicLink}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📧 メール送信
              </button>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-400 mt-0.5 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    メールに届いたリンクを踏むと、このページに戻ってログイン完了になります。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* セッション情報 */}
        {sessionUser && (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  2. セッション情報
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    ユーザーID
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <code className="text-sm text-slate-900 dark:text-white font-mono break-all">
                      {sessionUser.id}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    メールアドレス
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-slate-900 dark:text-white">
                      {sessionUser.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  国設定（JWT反映）
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-sm text-slate-900 dark:text-white font-medium">
                    {sessionUser.country ? (
                      <span className="flex items-center">
                        <span className="text-lg mr-2">
                          {sessionUser.country === "JP"
                            ? "🇯🇵"
                            : sessionUser.country === "US"
                            ? "🇺🇸"
                            : "🇪🇺"}
                        </span>
                        {sessionUser.country}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">
                        未設定
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={signOut}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚪 サインアウト
              </button>
            </div>

            {/* 国設定セクション */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0l1.403 5.777c.1.41.41.7.82.7h5.73c1.756 0 2.485 2.26 1.074 3.3l-4.64 3.37c-.4.29-.57.8-.4 1.25l1.75 5.22c.426 1.756-1.44 3.21-2.93 2.13l-4.64-3.37c-.4-.29-.95-.29-1.35 0l-4.64 3.37c-1.49 1.08-3.356-.374-2.93-2.13l1.75-5.22c.17-.45 0-.96-.4-1.25l-4.64-3.37c-1.41-1.04-.682-3.3 1.074-3.3h5.73c.41 0 .72-.29.82-.7l1.403-5.777z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  3. 国設定の更新
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    設定する国
                  </label>
                  <select
                    value={myCountry}
                    onChange={(e) =>
                      setMyCountry(e.target.value as "JP" | "US" | "EU")
                    }
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="JP">🇯🇵 日本</option>
                    <option value="US">🇺🇸 アメリカ</option>
                    <option value="EU">🇪🇺 ヨーロッパ</option>
                  </select>
                </div>

                <button
                  onClick={setCountryOnServer}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  ⚙️ 国設定を更新
                </button>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start">
                    <svg
                      className="h-5 w-5 text-amber-400 mt-0.5 mr-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.726-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Service Role を使って管理者として更新します（公開厳禁）
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RLSテストセクション */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  4. RLS 挙動の確認
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => insertRow("JP")}
                  className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🇯🇵 INSERT country=JP
                </button>

                <button
                  onClick={() => insertRow("US")}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🇺🇸 INSERT country=US
                </button>

                <button
                  onClick={() => insertRow("EU")}
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🇪🇺 INSERT country=EU
                </button>

                <button
                  onClick={readRows}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  📊 SELECT 最新5件
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-slate-400 mt-0.5 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    期待される挙動：user_metadata.country と一致する
                    INSERT/SELECT は許可、不一致は拒否
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ログセクション */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">実行ログ</h2>
            {log.length > 0 && (
              <span className="ml-auto px-3 py-1 bg-slate-700 text-slate-300 text-sm font-medium rounded-full">
                {log.length} 件
              </span>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            <pre className="text-sm text-slate-300 font-mono leading-relaxed">
              {log.length > 0 ? log.join("\n") : "ログがありません"}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
