---
description: Biome・Vitest・Storybookを導入した開発環境の刷新
globs: 
alwaysApply: false
---

# [Phase2] 開発環境刷新

## 概要 (Overview)

現在の開発環境はNext.jsの最小構成ESLint設定のみで、linter、formatter、テストフレームワークが未整備の状態です。品質管理・開発効率向上のため、モダンな開発ツール（Biome、Vitest、Storybook）を導入し、開発環境を刷新します。

## 背景と課題 (Background)

* **現状の課題:**
  * ESLintは最小構成（`["next", "next/core-web-vitals"]`のみ）
  * Formatterが未設定（コードスタイルの統一なし）
  * テストフレームワーク未導入（品質保証の仕組みなし）
  * UIコンポーネントの可視化・テスト環境なし

* **達成したいこと:**
  * 高速で一貫したlinting・formatting環境の構築（Biome）
  * 軽量で高速なテスト環境の整備（Vitest + Testing Library）
  * UIコンポーネントの開発・テスト環境の構築（Storybook）

## 実装計画 (Implementation Plan)

Phase2は以下の6つのサブタスクに分割され、順次実行されます：

### Phase2.1: [Biome導入](./Phase2/01_Biome導入.md)
- `@biomejs/biome` パッケージのインストール
- `biome.json` 設定ファイル作成
- ESLintとの段階的共存設定

### Phase2.2: [Vitest環境構築](./Phase2/02_Vitest環境構築.md)
- `vitest`、`@testing-library/react` のセットアップ
- `vitest.config.ts` 設定作成
- Firebase Mock対応

### Phase2.3: [Storybook環境構築](./Phase2/03_Storybook環境構築.md)
- `@storybook/nextjs` のセットアップ
- `.storybook/main.ts`、`.storybook/preview.ts` 設定
- Tailwind CSSとMUIの競合対策

### Phase2.4: [サンプル実装](./Phase2/04_サンプル実装.md)
- `TaskCard.test.tsx` の基本テスト実装
- `TaskCard.stories.tsx` のStorybook作成
- Firebase Mockの基本設定

### Phase2.5: [ESLint移行完了](./Phase2/05_ESLint移行完了.md)
- Biomeのルール調整と既存コードでのテスト
- `.eslintrc.json` の無効化
- `package.json` スクリプトの置き換え

### Phase2.6: [Tailwind CSS v4移行計画](./Phase2/06_TailwindCSS_v4移行計画.md)
- v4の主要変更点とブラウザサポート分析
- 移行戦略と実装手順の詳細
- リスク分析と対策

## 完了の定義 (Definition of Done)

* **機能要件:**
  - [ ] `yarn lint`、`yarn format`、`yarn test`、`yarn storybook` コマンドが動作すること
  - [ ] Biomeによるlinting・formattingが正常に動作すること
  - [ ] Vitestによる単体テストが実行可能であること
  - [ ] Storybookでコンポーネント確認が可能であること

* **テスト要件:**
  - [ ] TaskCardコンポーネントのテストが実装され、パスすること
  - [ ] TaskCardコンポーネントのStorybookストーリーが作成されていること

* **非機能要件:**
  - [ ] 既存のNext.js開発サーバーが正常に動作すること
  - [ ] ビルド時間の大幅な増加がないこと（Biomeは高速化を目的）
  - [ ] 各ツールの設定がプロジェクトのコーディング規約と一致していること

## 技術選定理由

* **Biome**: ESLint + Prettierより高速、Rustベースで安定、設定が簡単
* **Vitest**: Vite-nativeで高速、Jest互換API、ES Modules対応
* **Storybook**: デファクトスタンダード、Next.js公式サポート

## 関連資料

* [現状把握_LastMatorix.md](./現状把握_LastMatorix.md)（Phase 2 開発環境刷新）
* [refactor.md](./refactor.md)（目標アーキテクチャ）