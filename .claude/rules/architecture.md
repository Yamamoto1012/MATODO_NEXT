---
title: Architecture
description: ディレクトリ構成・コンポーネント設計・関数型・状態管理ルール
---

# Architecture

## ディレクトリ構造 — Colocation

ページで使うコンポーネントは、そのページと同階層の `components/` ディレクトリに置く。複数のページから使うものだけ上位に昇格する。

**例外**: `front/lib/` と `front/components/` (リポジトリ共通プリミティブ) は Colocation 対象外。共通ユーティリティ (例: `lib/utils.ts`) と共通 UI プリミティブ (例: `components/ui/button.tsx`) を置く。これらに対して Container/Presenter などのページ層ルールは適用しない。

```
front/
├── lib/                       # 共通ユーティリティ (例外)
│   └── utils.ts
├── components/                # 共通 UI プリミティブ (例外)
│   └── ui/
│       └── button.tsx
├── features/                  # 機能単位 (Auth / Tasks など)
│   └── Tasks/
│       └── ...
└── app/
    ├── Home/
    │   ├── page.tsx
    │   └── components/
    │       ├── MatrixArea/
    │       │   ├── MatrixArea.tsx
    │       │   └── MatrixArea.container.tsx
    │       └── TaskCard/
    │           └── TaskCard.tsx
    ├── Profile/
    │   ├── page.tsx
    │   └── components/
    │       └── ProfileForm/
    │           └── ProfileForm.tsx
    └── components/             # 複数ページから使うもののみ
        └── Sidebar/
            └── Sidebar.tsx
```

## ディレクトリ・ファースト構成

**コンポーネントは day1 から自分のディレクトリを持つ**。最初に `Component.tsx` をフラットに作って、後で子要素が増えたタイミングでディレクトリ化する、という流れを取らない。子コンポーネントが無くてもディレクトリを作ってその中に置く。

**初期状態** — 子コンポーネントなし、でもディレクトリは存在する:

```
components/
└── TaskCard/
    └── TaskCard.tsx              # Presenter (主コンポーネント)
```

**子コンポーネントが増えたとき** — 同じディレクトリ内の兄弟ファイルとして配置 (`components/` をネストさせない):

```
components/
└── TaskCard/
    ├── TaskCard.tsx              # Presenter
    ├── TaskCard.container.tsx    # Container
    └── PriorityBadge.tsx         # 子コンポーネント
```

子コンポーネントを別ファイルに切り出すタイミング:

- 子コンポーネントが ~30 行を超える
- 子コンポーネントが独自の props 型を持つ
- 子コンポーネントが独自のテストファイルを持つ

上記に該当するまでは、`TaskCard.tsx` 内に小さな内部ヘルパーコンポーネントとして置いてもよい (export しない)。

## 1 ファイル 1 コンポーネント

- 各 `.tsx` ファイルは 1 つのコンポーネントだけを export する
- ファイル名はコンポーネント名と一致させる (`TaskCard.tsx` → `TaskCard`)
- 内部ヘルパー関数や非公開のサブコンポーネントは OK だが、export してはいけない
- **`default export` 禁止**。常に名前付き export を使う。

## Container / Presenter パターン

コンポーネントを **Container** と **Presenter** に分割する。

**Presenter** — 純粋な描画コンポーネント。状態を持たず、出力は props だけで決まる。

```tsx
// TaskCard.tsx (Presenter)
type TaskCardProps = {
  title: string;
  importance: "high" | "low";
  urgency: "high" | "low";
  onToggleDone: () => void;
};

export const TaskCard = ({ title, importance, urgency, onToggleDone }: TaskCardProps) => (
  <div className={`p-4 rounded-lg ${importance === "high" ? "bg-red-100" : "bg-blue-100"}`}>
    <h3>{title}</h3>
    <span>{urgency === "high" ? "急" : "あとで"}</span>
    <button onClick={onToggleDone}>完了</button>
  </div>
);
```

**Container** — データ取得と状態を担当し、Presenter に props として渡す。

```tsx
// TaskCard.container.tsx (Container)
import { TaskCard } from "./TaskCard";
import { useTask } from "@/hooks/useTask";

type TaskCardContainerProps = { taskId: string };

export const TaskCardContainer = ({ taskId }: TaskCardContainerProps) => {
  const { data, toggleDone, isLoading } = useTask(taskId);
  if (isLoading || !data) return null;
  return (
    <TaskCard
      title={data.title}
      importance={data.importance}
      urgency={data.urgency}
      onToggleDone={toggleDone}
    />
  );
};
```

**命名規約**:

| ファイル | 役割 |
|---|---|
| `ComponentName.tsx` | Presenter |
| `ComponentName.container.tsx` | Container |

## ロジックは純粋関数として抽出

ビジネスロジックや変換処理は、コンポーネントから取り出して純粋関数として書く。

```ts
// utils.ts
export const classifyTask = (
  importance: "high" | "low",
  urgency: "high" | "low"
): "do" | "schedule" | "delegate" | "eliminate" => {
  if (importance === "high" && urgency === "high") return "do";
  if (importance === "high" && urgency === "low") return "schedule";
  if (importance === "low" && urgency === "high") return "delegate";
  return "eliminate";
};
```

純粋関数の要件:

- 同じ入力に対して常に同じ出力を返す
- 副作用を持たない (DOM 操作・API 呼び出し・外部変数の変更を行わない)
- 外部状態に依存しない

## Props ドリブン設計

コンポーネントは外部から props で制御できなければならない。内部状態に基づいて分岐する設計を避ける。

```tsx
// NG: 内部状態に閉じている
const Dialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  return isOpen ? <div>...</div> : null;
};

// OK: 外部から制御可能
type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Dialog = ({ isOpen, onClose }: DialogProps) => {
  if (!isOpen) return null;
  return (
    <div>
      ...
      <button onClick={onClose}>Close</button>
    </div>
  );
};
```

オプショナルな props にはデフォルト値を必ず与え、`undefined` の扱いを明確にする。

## 関数型プログラミング原則

### 純粋関数のみ

引数のみに依存し、外部状態を変更しない関数を作る。

```ts
// NG: 外部の変数に依存
let minimumAge = 18;
function isAdult(age: number): boolean {
  return age >= minimumAge;
}

// OK: 引数として必要な値をすべて受け取る
function isAdult(age: number, legalMinimumAge: number): boolean {
  return age >= legalMinimumAge;
}
```

### 変数の再代入禁止

`const` を使い、配列・オブジェクトの更新は新しいインスタンスを返す。

```ts
// NG: ミュータブルな更新
const numbers = [1, 2, 3];
numbers.push(4);

// OK: イミュータブルな更新
const numbers = [1, 2, 3] as const;
const newNumbers = [...numbers, 4];
```

### 早期 return

ガード節でネストを浅く保つ。

```ts
// NG: 深いネスト
function getDiscount(userType: string, amount: number): number {
  if (userType === "premium") {
    if (amount > 10000) return 0.15;
    return 0.1;
  }
  return amount > 5000 ? 0.05 : 0;
}

// OK: 早期 return
function getDiscount(userType: string, amount: number): number {
  if (userType !== "premium") return amount > 5000 ? 0.05 : 0;
  if (amount > 10000) return 0.15;
  return 0.1;
}
```

### 副作用の隔離

API 呼び出し・状態変更などの副作用を伴う処理は、専用関数やカスタムフックに切り出す。React コンポーネントでは `useFetch` / `useAnalytics` のようなカスタムフックに集約する。

## 状態管理

### 関連状態の集約

関連する状態は、カスタムフックまたはオブジェクトに集約して再レンダリングを最小化する。

### イミュータブル更新を徹底する

Jotai / Zustand / `useState` / `useReducer` いずれを使う場合も、配列・オブジェクトの更新は **`map` / `filter` / `reduce` / spread (`...`)** を使い、新しい参照を返す。

```tsx
// Jotai 例 — 書き込み専用 atom でイミュータブル更新
import { atom } from "jotai";

type Task = { id: string; title: string; isDone: boolean };

export const tasksAtom = atom<Task[]>([]);

export const toggleTaskAtom = atom(null, (get, set, taskId: string) => {
  set(tasksAtom, prev =>
    prev.map(task => (task.id === taskId ? { ...task, isDone: !task.isDone } : task))
  );
});
```

```tsx
// useReducer 例
type Action =
  | { type: "add"; payload: Task }
  | { type: "toggle"; payload: { id: string } };

function reducer(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "toggle":
      return state.map(task =>
        task.id === action.payload.id ? { ...task, isDone: !task.isDone } : task
      );
  }
}
```

## 機能単位のディレクトリ分割と定数集約

- **機能単位**で `front/features/<FeatureName>/` を切る (例: `features/Auth/` / `features/Tasks/`)
- 列挙型・定数は `front/constants/` (または `front/lib/constants.ts`) に集約し、再利用性と型安全性を確保する

```ts
// constants/task.ts
export const TASK_STATUS = {
  Invalid: 0,
  Valid: 1,
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
```
