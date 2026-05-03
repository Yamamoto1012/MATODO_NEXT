---
title: Testing
description: 単体テスト方針 (Vitest + Testing Library) と書き方
---

# Testing

## テストを書くタイミング

「後から誰かが変更したとき、このテストは回帰を捕捉できるか?」を基準に判断する。**全コンポーネントに機械的にテストを書かない**。

- **純粋関数 (`utils.ts` などに置く関数)**: **必ずテストを書く**。同階層に `*.test.ts` を置き、すべての分岐をカバーする。
- **コンポーネント**: 以下のいずれかに該当する場合に書く。該当しない静的なコンポーネントは省略してよい。
  - 描画が props / 状態によって変化する (条件分岐がある)
  - a11y 属性 (`aria-*` / `role` / `htmlFor` / `tabIndex` / キーハンドラ等) がある
  - 上記に該当するコンポーネントを変更する場合 (回帰防止)
- **Container**: データ取得をモックし、Presenter に渡す props を検証する。
- **Presenter**: 上記「コンポーネント」基準に従う。a11y 属性のない静的描画ならテスト不要。

判断基準: 「他の人が後でこのコンポーネントを変更したとき、意図しない変更をテストが捕捉できるか?」 — 価値のあるケースに `snapshot` / `getByRole` / `getByLabelText` 等で投資する。

## ホワイトボックステスト

入出力だけでなく、内部のロジックパスも検証する。

## AAA パターン + 1 test = 1 expect

すべてのテストは **Arrange / Act / Assert** に従う。1 ケースにつき `expect` は 1 つ。

テスト名のフォーマット: `"should [expected behavior] when [condition]"` (日本語可)。

### 純粋関数テスト — 全分岐をカバー

```ts
import { describe, it, expect } from "vitest";
import { classifyTask } from "./utils";

describe("classifyTask", () => {
  it("should return 'do' when importance and urgency are both high", () => {
    // Arrange
    const importance = "high" as const;
    const urgency = "high" as const;

    // Act
    const result = classifyTask(importance, urgency);

    // Assert
    expect(result).toBe("do");
  });

  it("should return 'schedule' when importance is high and urgency is low", () => {
    // Arrange
    const importance = "high" as const;
    const urgency = "low" as const;

    // Act
    const result = classifyTask(importance, urgency);

    // Assert
    expect(result).toBe("schedule");
  });
});
```

### Presenter テスト — props バリエーションごとに検証

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TaskCard } from "./TaskCard";

describe("TaskCard", () => {
  it("should render title when given", () => {
    // Arrange & Act
    render(
      <TaskCard
        title="買い物"
        importance="high"
        urgency="low"
        onToggleDone={() => {}}
      />
    );

    // Assert
    expect(screen.getByText("買い物")).toBeInTheDocument();
  });
});
```

### Container テスト — データ取得をモックし、Presenter に渡す props を検証

データ取得フックをモックし、Presenter に正しい props が渡るかをアサートする。

## テスト戦略

- 純粋関数: すべての分岐パスをカバーする
- Presenter: 各 props バリエーションを検証する
- Container: データ取得をモックし、Presenter に渡す props を検証する
- 境界値・エッジケースを明示的にテストする

## 推奨ディレクトリ・ファイル命名

- テストファイルは対象コンポーネント・関数の同階層に置き、`*.test.tsx` または `*.test.ts` を付ける
- 共通ユーティリティ・モックは `front/test/` 配下にまとめる

## ユーザー視点で検証

- DOM 構造やクラス名でアサートしない (実装詳細をテストしない)
- `getByRole` / `getByLabelText` / `getByText` などユーザー視点のクエリを優先する
- インタラクションは **`user-event`** を使い、実際の操作を再現する

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("should call onToggleDone when complete button is clicked", async () => {
  // Arrange
  const onToggleDone = vi.fn();
  render(<TaskCard title="買い物" importance="low" urgency="low" onToggleDone={onToggleDone} />);
  const user = userEvent.setup();

  // Act
  await user.click(screen.getByRole("button", { name: "完了" }));

  // Assert
  expect(onToggleDone).toHaveBeenCalledTimes(1);
});
```

## 共通セットアップ (`vitest.config.ts` / `test/setup.ts`)

`@testing-library/jest-dom` と必要なら MSW サーバを `setupFiles` で初期化する。

```ts
// test/setup.ts (例)
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

API モックが必要な場合は `msw` を導入し、デフォルトハンドラを `front/test/mocks/handlers.ts` にまとめる。テスト内で `server.use()` を使い分岐ケース (例外 / 空配列 / 遅延) を個別に上書きする。

## 実行

```bash
cd front
yarn test:run             # 全テストを 1 回走らせる (CI 用)
yarn test                 # watch モード (開発用)
yarn test:coverage        # カバレッジ計測
```

カバレッジ閾値の目安は statements / branches **90%**。
