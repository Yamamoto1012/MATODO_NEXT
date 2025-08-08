# コードスタイルと規約

## JavaScript/TypeScript規約

### ファイル拡張子
- React コンポーネント: `.jsx`
- ページコンポーネント: `.jsx` または `.js`
- 設定ファイル: `.js`

### コンポーネント命名
- **関数コンポーネント**: 
  - export default function (匿名関数をエクスポート)
  - PascalCase でファイル名 (例: `Menu.jsx`, `AddTask.jsx`)

### インポート規約
```javascript
// React関連を最初に
import React from "react";
import { useRouter } from "next/navigation";

// 相対パスでのコンポーネントインポート
import Menu from "../../ui/Menu";
import MatrixArea from "../../ui/MatrixArea";
```

### スタイリング
- **主要**: TailwindCSS クラス使用
- **色パレット**: 
  - 背景: `bg-[#393E4F]`, `bg-[#222831]`
  - ダーク系のカラーパレットを使用

### TypeScript設定
- `strict: false` - 厳密モード無効
- JSとTSの混在を許可
- Next.js用プラグイン使用

## プロジェクト構造規約

### ディレクトリ構造
```
front/
├── app/           # Next.js App Router
│   ├── (auth)/    # 認証関連のルートグループ
│   └── [page]/    # 各ページ
└── ui/            # 再利用可能コンポーネント
```

### ファイル命名
- ページファイル: `page.jsx`
- コンポーネント: PascalCase (例: `TaskList.jsx`)
- 設定ファイル: kebab-case (例: `tailwind.config.js`)

## ESLint設定
- Next.js recommended ルール
- Prettier連携
- next/babel設定