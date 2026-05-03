---
title: Coding Style
description: 命名・コメント・コードスタイル・Tailwind 利用ルール
---

# Coding Style

## 命名

- **完全かつ明示的な識別子**を使用し、省略語を避ける (`userId` / `targetUserIndex` / `paymentMethod` など)。
- 変数名・関数名は、その役割が一目でわかるように、省略せずに記述する。
- 名前衝突が起きうる場合のみ、ドメインを示す接頭辞・接尾辞を検討する (過剰使用は冗長になるため避ける)。

```ts
// NG: 短すぎる、または曖昧な名前
const val = 10;
const idx = users.findIndex(u => u.id === currentId);

// OK: 明確で具体的な名前
const maxLoginAttempts = 10;
const targetUserIndex = users.findIndex(user => user.id === currentUserId);
```

## コメント

- **「何をするか」でなく「なぜそうするか」を書く**。コードを読めば分かることはコメントしない。
- 意図・背景・設計判断・パフォーマンス上の理由・セキュリティ上の理由など、コードに表れない情報のみ書く。

```ts
// NG: コードを読めば分かる
// i を 1 増やす
i++;

// OK: なぜそうするのかを説明
// セッション切れでリダイレクトされた場合、ログイン後に元のページに戻すために現在のパスを保存する。
saveReturnToPath(currentPath);
```

## 文字列結合はテンプレートリテラル

```ts
// NG
const message = "Hello, " + name + "! You have " + count + " messages.";

// OK
const message = `Hello, ${name}! You have ${count} messages.`;
```

## 条件分岐は三項演算子またはオブジェクトマッピング

if-else 連鎖を避け、状態 → 値の対応はオブジェクトマップで表現する。

```ts
// NG
function getStatus(status: string): string {
  if (status === "pending") return "処理中";
  if (status === "completed") return "完了";
  if (status === "failed") return "失敗";
  return "不明";
}

// OK
const STATUS_MESSAGES = {
  pending: "処理中",
  completed: "完了",
  failed: "失敗",
} as const;

function getStatus(status: keyof typeof STATUS_MESSAGES): string {
  return STATUS_MESSAGES[status] ?? "不明";
}
```

## import 順序

1. 外部ライブラリ (`react` / `next` / `firebase` / `axios` など)
2. UI フレームワーク (`@mui/material` / `@/components/ui` など)
3. エイリアス (`@/hooks` / `@/lib` / `@/features`)
4. 相対パス (`./Sibling` / `../Util`)

```ts
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { z } from "zod";

import { Button } from "@mui/material";

import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/constants";

import { UserProfile } from "./UserProfile";
import type { User } from "../types";
```

## 型安全性

- **`any` 禁止**。型が分からない値は `unknown` を使い、絞り込んでから扱う。
- **`default export` 禁止**。`export const Component` のような名前付き export を使う。
- **`const` 原則**。再代入が必要な場合は別名変数を導入し、`let` は使わない。
- マジックナンバー / マジックストリングは定数化する (`/constants` 配下に集約)。

```ts
// NG: any
function processData(data: any): any { return data.map((item: any) => item.value); }

// OK: 具体的な型
type DataItem = { id: string; value: number };
function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}
```

```ts
// NG: マジックナンバー
if (user.age < 18) return "未成年";

// OK: 定数化
const LEGAL_AGE = 18;
if (user.age < LEGAL_AGE) return "未成年";
```

## ループ禁止 (No Loops)

`for` / `for...in` / `for...of` / `while` / `do...while` は禁止。配列 API で表現する。

```ts
// NG
const results: number[] = [];
for (let i = 0; i < items.length; i++) {
  results.push(transform(items[i]));
}

// OK
const results = items.map(transform);
```

| 目的 | 使う API |
|---|---|
| 変換 | `map` |
| 抽出 | `filter` |
| 集約 | `reduce` |
| 平坦化 + 変換 | `flatMap` |
| 副作用 | `forEach` |
| 存在判定 | `some` / `every` / `find` |

例外: ストリーミング処理など `for await...of` が必須な場面では使用可。コメントで理由を明示する。

## Tailwind 利用ルール

- **任意値構文 `[...]` を避ける**。サイズは `w-80` のような数値クラスを使い、色・フォントサイズ・角丸などのトークン化可能な値は `globals.css` のテーマトークンを通して参照する。
- **不透明度修飾子 `-XXX/YY` (`text-gray-800/80` など) で色の濃淡を作らない**。「より薄い色が欲しい」場合は別のシェードクラスに切り替える (`text-gray-800` → `text-gray-700`)。本当に透過が必要な場合のみトークンを追加する。
- 複雑なクラス結合は `twMerge` を使う。
- shadcn/ui や MUI のプリミティブを優先的に使い、必要に応じて `variant` で拡張する。

```tsx
// NG: 任意値 + opacity による濃淡調整
<div className="w-[327px] text-[13px] bg-[#1a1a1a] rounded-[10px] text-gray-800/80" />

// OK: 数値クラス・トークン経由・シェード切替
<div className="w-80 text-sm bg-background rounded-lg text-gray-700" />
```

## アニメーション

- **Framer Motion** を採用する。`motion.div` などの薄いラッパーをレイアウト側で管理する。
- 共通アニメーションは `front/components/animations` に集約する。
