# 🌍 デジタル主権実験プロジェクト

## 📋 プロジェクト概要

このプロジェクトは、**デジタル主権**の概念を実践的に検証するための実験的な Web アプリケーションです。具体的には、異なる地理的リージョン（日本、アメリカ、ヨーロッパ）に配置されたデータベースへのアクセス性能を測定し、データの地域制限（RLS: Row Level Security）の動作を確認することを目的としています。

### 🎯 主な目的

- **リージョン別パフォーマンス測定**: 各地域のデータベースへのアクセス速度を比較
- **データ主権の実証**: ユーザーの国設定に基づいてデータアクセスを制限する仕組みの検証
- **実用的なベンチマークツール**: 実際のビジネスで使える性能測定システムの構築

---

## 🚀 機能一覧

### 1. 📊 リージョン別レイテンシ測定

**場所**: メインページ（`/`）

**機能説明**:

- 日本（JP）、アメリカ（US）、ヨーロッパ（EU）の 3 つのリージョンに配置された Supabase データベースへのアクセス速度を測定
- データベース操作（作成・読み取り・更新・削除）の実行時間をミリ秒単位で計測
- 平均値と 95 パーセンタイル値を算出してパフォーマンスを評価
- 測定結果を CSV ファイルとしてダウンロード可能

**測定可能な操作**:

- **CREATE（作成）**: 新しいデータレコードを追加
- **READ（読み取り）**: 既存のデータレコードを取得
- **UPDATE（更新）**: 既存のデータレコードを変更
- **DELETE（削除）**: 既存のデータレコードを削除

**測定設定**:

- 試行回数: 1〜200 回（デフォルト 50 回）
- 各測定間隔: 20 ミリ秒
- 結果表示: 平均値、95 パーセンタイル値、生データ

### 2. 🔐 RLS（Row Level Security）デモ

**場所**: RLS ページ（`/rls`）

**機能説明**:

- ユーザーの国設定に基づいてデータアクセスを制限するセキュリティ機能のデモ
- ユーザーは自分の国設定を変更でき、その設定に応じてアクセス可能なデータが変わる
- 実際のセキュリティポリシーの動作を視覚的に確認可能

**主な機能**:

- **Magic Link 認証**: メールアドレスだけでログイン（パスワード不要）
- **国設定管理**: ユーザーの国設定を管理者権限で変更
- **データアクセステスト**: 異なる国のデータへのアクセス試行
- **リアルタイムログ**: アクセス試行の結果をリアルタイムで表示

---

## 🛠️ 技術仕様

### 使用技術

- **フロントエンド**: Next.js 15.5.4 + React 19.1.0
- **スタイリング**: Tailwind CSS 4.0
- **データベース**: Supabase（PostgreSQL）
- **認証**: Supabase Auth
- **言語**: TypeScript 5.0

### アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   日本リージョン    │    │   アメリカリージョン  │    │  ヨーロッパリージョン  │
│  Supabase JP    │    │  Supabase US    │    │  Supabase EU    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Next.js App   │
                    │  (ベンチマーク実行)  │
                    └─────────────────┘
```

### データベース設計

**レイテンシ測定用テーブル** (`records_bench`):

- `id`: レコードの一意識別子
- `content`: データの内容
- `region`: リージョン（JP/US/EU）
- `created_at`: 作成日時

**RLS デモ用テーブル** (`records_rls`):

- `id`: レコードの一意識別子
- `content`: データの内容
- `country`: 国設定（JP/US/EU）
- `created_at`: 作成日時

---

## 🚀 セットアップ手順

### 前提条件

- Node.js 18.0 以上
- npm、yarn、pnpm、または bun のいずれか
- Supabase アカウント（3 つのリージョンでプロジェクト作成が必要）

### 1. リポジトリのクローン

```bash
git clone [リポジトリURL]
cd test
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
# または
pnpm install
# または
bun install
```

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# 日本リージョン
NEXT_PUBLIC_SUPABASE_URL_JP=your_japan_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY_JP=your_japan_anon_key

# アメリカリージョン
NEXT_PUBLIC_SUPABASE_URL_US=your_us_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY_US=your_us_anon_key

# ヨーロッパリージョン
NEXT_PUBLIC_SUPABASE_URL_EU=your_eu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY_EU=your_eu_anon_key

# 管理者権限（RLSデモ用）
SUPABASE_SERVICE_ROLE_URL=your_service_role_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. データベースのセットアップ

各リージョンの Supabase プロジェクトで以下のテーブルを作成してください：

**レイテンシ測定用テーブル**:

```sql
CREATE TABLE records_bench (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS デモ用テーブル**:

```sql
CREATE TABLE records_rls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSポリシーの設定
ALTER TABLE records_rls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their country's data" ON records_rls
  FOR ALL USING (country = (auth.jwt() ->> 'user_metadata' ->> 'country'));
```

### 5. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

### 6. アプリケーションの確認

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションが正常に動作することを確認してください。

---

## 📖 使用方法

### レイテンシ測定の使い方

1. **測定条件の設定**

   - 操作タイプを選択（CREATE/READ/UPDATE/DELETE）
   - リージョンを選択（日本/アメリカ/ヨーロッパ）
   - 試行回数を設定（1〜200 回）

2. **測定の実行**

   - 「この条件で実行」ボタンで単一条件の測定
   - 「JP/US/EU × CRUD 全実行」ボタンで全条件の一括測定

3. **結果の確認**

   - 測定結果がテーブル形式で表示
   - 平均値と 95 パーセンタイル値でパフォーマンスを評価
   - 色分けで性能レベルを視覚的に確認

4. **データのエクスポート**
   - 「CSV ダウンロード」ボタンで結果を CSV ファイルとして保存

### RLS デモの使い方

1. **ログイン**

   - メールアドレスを入力して「メール送信」ボタンをクリック
   - 送信されたメールのリンクをクリックしてログイン

2. **国設定の変更**

   - ログイン後、国設定を選択して「国設定を更新」ボタンをクリック
   - 設定が反映されるまで数秒待機

3. **データアクセステスト**

   - 異なる国のデータへの INSERT/SELECT 操作を試行
   - ログでアクセス許可/拒否の結果を確認

4. **結果の確認**
   - ログセクションでリアルタイムにアクセス結果を確認
   - 自分の国設定と一致するデータのみアクセス可能であることを確認

---

## 📊 測定結果の見方

### レイテンシ値の解釈

- **100ms 未満**: 非常に高速（緑色表示）
- **100-300ms**: 良好（黄色表示）
- **300ms 以上**: 改善が必要（赤色表示）

### 統計値の意味

- **平均値（avg_ms）**: 全測定の平均実行時間
- **95 パーセンタイル（p95_ms）**: 95%の測定がこの時間以内に完了
- **生データ（raw）**: 各測定の個別実行時間

### パフォーマンス比較のポイント

- 地理的距離による影響
- ネットワーク品質の違い
- データベースサーバーの性能差
- リージョン間のインフラストラクチャの違い

---

## 🔧 開発者向け情報

### プロジェクト構造

```
test/
├── app/                    # Next.js App Router
│   ├── page.tsx           # メインページ（レイテンシ測定）
│   ├── rls/               # RLSデモページ
│   │   └── page.tsx
│   ├── api/               # API エンドポイント
│   │   ├── bench/         # ベンチマーク実行API
│   │   └── admin/         # 管理者API
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   └── ResultsTable.tsx   # 結果表示テーブル
├── lib/                   # ライブラリ・ユーティリティ
│   ├── bench.ts          # ベンチマーク実行ロジック
│   ├── supabaseClients.ts # Supabaseクライアント設定
│   └── supabaseAdmin.ts   # 管理者クライアント
├── types/                 # TypeScript型定義
│   └── supabase.ts        # Supabase型定義
└── utils/                 # ユーティリティ関数
    └── csv.ts            # CSV出力機能
```

### 主要な技術的実装

**ベンチマーク実行**:

- 各リージョンへの並列接続
- 統計的測定（平均値、95 パーセンタイル）
- エラーハンドリングとリトライ機能

**RLS 実装**:

- JWT（JSON Web Token）ベースの認証
- ユーザーメタデータによる国設定管理
- データベースレベルでのアクセス制御

**UI/UX**:

- レスポンシブデザイン（モバイル対応）
- ダークモード対応
- アニメーションとトランジション効果
- アクセシビリティ対応

---

## 🚨 注意事項

### セキュリティ

- 管理者キー（Service Role Key）は絶対に公開しないでください
- 本番環境では適切な環境変数管理を行ってください
- RLS ポリシーは本番環境で十分にテストしてください

### パフォーマンス

- 測定結果はネットワーク状況に大きく依存します
- 同一環境・同一回線での測定を推奨します
- 大量の測定実行時はデータベースの負荷に注意してください

### データ管理

- 測定データは自動的にクリーンアップされません
- 定期的なデータベースメンテナンスを推奨します
- 個人情報を含むデータの取り扱いに注意してください

---

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は `LICENSE` ファイルを参照してください。



## 🔮 今後の予定

- [ ] より詳細な統計分析機能
- [ ] リアルタイム監視ダッシュボード
- [ ] 複数ユーザーでの同時測定
- [ ] より多くのリージョン対応
- [ ] グラフ表示機能の追加

---
