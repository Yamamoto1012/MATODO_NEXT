---
title: Dependencies
description: 依存ライブラリの追加・更新方針
---

# Dependencies

## パッケージマネージャ

`yarn` を使う。`npm` / `pnpm` / `bun` は混在させない。

```bash
cd front
yarn install              # 既存依存をインストール
yarn add <pkg>            # dependencies 追加
yarn add -D <pkg>         # devDependencies 追加
yarn list --depth=0       # 直接依存のバージョン確認
```

## バージョン固定 (Exact Version Pinning)

リファクタ完了までは依存ライブラリの更新を意図的に行うため、`package.json` のバージョンは **完全固定**を原則とする。`^` / `~` / メジャー指定 (`"4"` / `"^20"`) は避け、`"1.2.3"` のように exact version を書く。

**NG**:

```json
{
  "dependencies": {
    "next": "^15.4.6",
    "react": "19"
  }
}
```

**OK**:

```json
{
  "dependencies": {
    "next": "15.4.6",
    "react": "19.0.0"
  }
}
```

**追加・更新時の作法**:

- 追加: `yarn add -E <pkg>` / `yarn add -E -D <pkg>` (`-E` で exact 固定)
- 既存依存の更新後、`package.json` に `^` / `~` / メジャー指定が残っていないかを確認する。残っていたら手動で exact に直す。
- 現行インストール版を確認するには `yarn list --depth=0` を使う。
- `package.json` と `yarn.lock` を常に一致させる。

理由: 「どの環境でも同じバージョンが入る」ことを保証することで、リファクタ作業中の差分要因を依存バージョン以外に絞り込みやすくする。

## バージョンアップの進め方

- 大きいバージョンアップ (Next.js / TypeScript / Tailwind / MUI / ESLint 等) は **1 ライブラリ 1 ISSUE** で行う (親 ISSUE 配下のサブ ISSUE)。
- 仕様書 `仕様書-Claude-Code活用基盤整備.md` の **Phase 2 (依存関係最新化)** ロードマップを参照する。
- マイナー追従は `yarn upgrade-interactive --latest` でまとめて行ってよいが、PR は機械的更新の旨を明記する。
- **MUI v5 → v7** は中継 (v6) を挟まず一気に上げる方針 (仕様書 line 23 / line 319 参照)。
- ESLint v8 → v9 は flat config 化を伴う。
- **MUI のバージョンアップで v6 を中継してはならない**。同じ箇所を 2 回触るコストが上回るため。

## 主要ライブラリ (現状)

`front/package.json` の主要依存 (バージョンは現行値、Phase 2 で最新化対象):

| 用途 | ライブラリ |
|---|---|
| フレームワーク | `next` (App Router) |
| ビュー | `react` / `react-dom` |
| UI | `@mui/material` / `@mui/icons-material` / `@emotion/react` / `@emotion/styled` |
| スタイル | `tailwindcss` / `postcss` / `autoprefixer` |
| 認証・DB | `firebase` |
| HTTP | `axios` |
| DnD | `@dnd-kit/core` / `@dnd-kit/sortable` |
| 日付 | `react-datepicker` |
| Lint / Format | `@biomejs/biome` (+ `eslint` は移行期) |
| テスト | `vitest` / `@vitest/coverage-v8` / `@vitest/ui` / `@testing-library/*` / `jsdom` |
| ビルド | `vite` (テスト基盤として) |
| 型 | `typescript` / `@types/react` |

## 環境変数

- 機密情報は `.env.local` (フロント) / `.env` (バックエンド) に置く。**git に commit しない**。
- フロントから読む変数は `NEXT_PUBLIC_` プレフィックスが必要 (Next.js 仕様)。
- 値の例は `front/.env.local.example` などに **空値で**コミットする。
