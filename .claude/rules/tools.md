---
title: Tools
description: Biome / Vitest / TypeScript / Next.js などツールの使い方
---

# Tools

`front/` ディレクトリで実行する想定。

## Biome (Lint + Format)

設定: `front/biome.json`

```bash
cd front
yarn lint:biome           # lint チェック (read-only)
yarn lint:biome:fix       # lint 自動修正
yarn format:biome         # フォーマット適用
yarn check:biome          # lint + format 一括 (自動修正あり)
```

ESLint は `eslint` v8 + `eslint-config-next` が暫定的に併存しているが、Phase 2 で v9 + flat config に移行する。Biome を主、ESLint を Next.js 互換用 (`yarn lint`) として使い分ける。

## TypeScript

設定: `front/tsconfig.json`

型チェック単体実行 (ファイルを生成しない):

```bash
cd front
yarn run -T tsc --noEmit
```

`any` 禁止。型推論で困ったら `unknown` で受けて絞り込む。

## Vitest (Unit Test)

設定: `front/vitest.config.ts`

```bash
cd front
yarn test:run             # 全テスト 1 回 (CI 用)
yarn test                 # watch モード (開発用)
yarn test:watch           # watch (上のエイリアス)
yarn test:ui              # GUI (`@vitest/ui`)
yarn test:coverage        # V8 カバレッジ計測
```

書き方は `.claude/rules/testing.md` を参照。

## Next.js (App Router)

```bash
cd front
yarn dev                  # 開発サーバ (http://localhost:3000)
yarn build                # プロダクションビルド
yarn start                # ビルド済みアプリの起動
yarn lint                 # next lint (ESLint 経由)
```

App Router を使う。Pages Router と混在しない (新規ページは `app/` 配下に作る)。

## Firebase

`front/app/firebase.js` で初期化。Auth / Firestore / Storage を利用。Firestore のドキュメント ID は `addDoc(collection(...))` 等で自動採番を推奨 (`setDoc(doc(db, "tasks", title))` のような ID 衝突を避ける)。

## Docker (任意)

リポジトリルートで `docker compose up --build` するとフロント (3000) とバックエンド (5001) が起動する。

## Claude Code 関連 (本リポジトリ独自)

- `CLAUDE.md` (リポジトリルート): セッション起動時に自動ロードされる。`@.claude/rules/*.md` で本ディレクトリのルールを include する。
- `.claude/settings.json` / `.claude/settings.local.json`: permissions / hooks / MCP enable / plugins。後者は git 管理外。
- `.claude/skills/<name>/SKILL.md`: ユーザー or AI 自律呼び出し可能なスキル。
- `.mcp.json`: MCP サーバー定義 (将来 `context7` を追加予定、サブ #67)。

## 将来導入予定 (本仕様書 Phase 1 / サブ ISSUE)

- **lefthook** (git hook): pre-commit / pre-push で lint + typecheck (人間操作の境界)
- **knip** (サブ #68): 未使用 export / file / dependency の検出
- **similarity-ts** (サブ #69): 重複した型・関数の検出
- **Claude hooks** (サブ #63 / #64 / #70): PostToolUse での lint+typecheck、Stop での品質ゲート、knip / similarity-ts 統合
- **permissions** (サブ #62): 破壊的コマンドのブロック
- **/commit skill** (サブ #66): 1 コミット = 1 意図のコミット分割支援
- **context7 MCP** (サブ #67): ライブラリ最新仕様の取得
