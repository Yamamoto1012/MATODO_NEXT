---
description: 機能別フォルダ構成への移行と全コンポーネントのContainer/View分離
globs: 
alwaysApply: false
---

# [Phase4] 機能別フォルダ構成移行

## 1. 背景 (Background)

* **なぜこのタスクが必要か？**
  * Phase3でJotaiによる状態管理とTaskListのContainer/View分離が完了し、モダンなアーキテクチャの基盤が確立されました。
  * 現在の`front/app/*`（ページ）+ `front/ui/*`（コンポーネント）の構成では、機能横断的な開発・保守が困難になっており、責務分離が不十分です。
  * 今後のスケーラビリティとメンテナンス性を向上させるため、機能別フォルダ構成（Feature-Driven Folder Structure）への移行が必要です。
* **現状の課題:** 
  * コンポーネントが機能別に整理されていない（task関連、auth関連、matrix関連が混在）
  * AddTask、MatrixArea、TaskCardコンポーネントでContainer/View分離が未実施
  * 表示ロジックとビジネスロジックが混在（特にTaskCard、MatrixArea）
  * 重複したFirestoreクエリロジック（MatrixArea と TaskList）
  * 手動リロードに依存した状態同期（MatrixArea）
* **達成したいこと:** 
  * `src/features/*`による機能別フォルダ構成の確立
  * 全コンポーネントのContainer/View分離完了
  * Phase3で確立したJotai状態管理パターンの全面適用
  * コードの保守性・テスタビリティ・再利用性の大幅向上
* **関連資料:**
  * Phase3_状態管理導入.md（確立されたパターン）
  * 現状把握_LastMatorix.md（目標アーキテクチャ）

## 2. 詳細 (Details)

* **何を実装するのか？**
  * - [ ] 新フォルダ構成の作成（`src/features/*`, `src/components/ui/*`）
  * - [ ] 共通コンポーネントの移行（Days, ProfileCard, Menu → `src/components/ui/`）
  * - [ ] TaskCardのContainer/View分離・日付計算ロジックの分離
  * - [ ] AddTaskのContainer/View分離・Jotai統合・IMEフックの作成
  * - [ ] MatrixAreaのContainer/View分離・Jotai統合・TaskCategory分離
  * - [ ] 認証関連コンポーネントのリファクタリング（`src/features/auth/`）
  * - [ ] Next.js App Routerページの移行（`front/app/` → `src/app/`）
  * - [ ] 全インポートパスの更新・Firebase設定の移行
  * - [ ] テスト・Storybookファイルの移行

## 3. 完了の定義 / 終了要件 (Definition of Done / Acceptance Criteria)

* **機能要件:**
  * - [ ] 全ページが正常に動作し、既存機能に影響がないこと
  * - [ ] タスクのCRUD操作がリアルタイムで全コンポーネントに反映されること
  * - [ ] MatrixAreaの手動リロードが不要になっていること
  * - [ ] AddTaskでタスク作成時、MatrixAreaにリアルタイム反映されること
* **非機能要件:**
  * - [ ] 全コンポーネントがContainer/Viewパターンに準拠していること
  * - [ ] TypeScriptによる型安全性が確保されていること
  * - [ ] 重複コードが削減され、コードの再利用性が向上していること
  * - [ ] ビルド時間・実行時パフォーマンスが向上または同等であること
* **テスト要件:**
  * - [ ] 各機能のContainer・Viewコンポーネントのテストが実装されていること
  * - [ ] 共通ユーティリティ関数のテストが実装されていること
  * - [ ] Storybookで全UIコンポーネントが確認できること

## 4. 実装方針 (Implementation Plan)

* **影響範囲の調査:**
  * - 新規作成: `src/`ディレクトリ全体
  * - 移行: `front/app/` → `src/app/`（Next.js App Router）
  * - 移行: `front/ui/` → `src/features/*/components/`
  * - 新規作成: `src/components/ui/`（共通コンポーネント）
  * - 修正: 全インポートパス

* **実装ステップ:**
  
  1. **新フォルダ構成の作成:**
     ```
     src/
     ├── app/                 (Next.js App Router)
     ├── features/
     │   ├── auth/
     │   │   ├── components/
     │   │   ├── hooks/
     │   │   └── types/
     │   ├── task/
     │   │   ├── components/
     │   │   │   ├── AddTask/
     │   │   │   ├── TaskList/ (Phase3で作成済み)
     │   │   │   └── TaskCard/
     │   │   ├── hooks/
     │   │   └── types/
     │   ├── matrix/
     │   │   ├── components/MatrixArea/
     │   │   ├── hooks/
     │   │   └── types/
     │   └── profile/
     ├── components/ui/       (共通UIコンポーネント)
     ├── store/              (Phase3で作成済み)
     ├── hooks/              (Phase3で作成済み)
     ├── lib/                (Firebase設定等)
     ├── utils/              (共通ユーティリティ)
     └── types/              (共通型定義)
     ```

  2. **共通コンポーネントの移行:**
     * `Days.jsx` → `src/components/ui/Days/`
     * `ProfileCard.jsx` → `src/components/ui/ProfileCard/`
     * `Menu.jsx` → `src/components/ui/Layout/Menu/`

  3. **TaskCardのリファクタリング:**
     * `src/utils/dateUtils.ts`: JST日付計算ユーティリティ
     * `src/features/task/components/TaskCard/TaskCardContainer.tsx`: ロジック担当
     * `src/features/task/components/TaskCard/TaskCardView.tsx`: 表示専用
     * `src/features/task/components/TaskCard/TaskCard.tsx`: エントリーポイント

  4. **AddTaskのリファクタリング:**
     * `src/hooks/useIME.ts`: IME変換状態管理フック
     * `src/features/task/components/AddTask/AddTaskContainer.tsx`: ロジック + Jotai統合
     * `src/features/task/components/AddTask/AddTaskView.tsx`: 表示専用
     * `src/features/task/components/AddTask/AddTask.tsx`: エントリーポイント

  5. **MatrixAreaのリファクタリング（最重要）:**
     * `src/features/matrix/components/MatrixArea/MatrixAreaContainer.tsx`: Jotai統合・リアルタイム更新
     * `src/features/matrix/components/MatrixArea/MatrixAreaView.tsx`: 表示専用
     * `src/features/matrix/components/TaskCategory/TaskCategory.tsx`: カテゴリコンポーネント分離
     * 手動リロード機能の削除（Jotaiによるリアルタイム更新で代替）

  6. **認証関連コンポーネントのリファクタリング:**
     * `src/features/auth/components/AuthForm/`
     * `src/features/auth/components/LoginForm/`
     * `src/features/auth/components/ProfileCreation/`
     * `src/features/auth/hooks/useAuth.ts`

  7. **Next.js App Routerページの移行:**
     * `front/app/` → `src/app/`
     * すべてのページファイルのインポートパス更新
     * `src/lib/firebase.ts`への移行

  8. **段階的移行とテスト:**
     * 各コンポーネントの移行後、即座に動作確認
     * 旧ファイルは移行完了確認後に削除
     * インポートパスの一括更新

## 5. 備考 (Notes)

* **リスク最小化戦略（重要）:**
  * **破壊的変更の回避**: `front/` → `src/` は実質的に破壊的、細心な段階化が必須
  * **並行開発環境**: 既存環境を保持しつつ新環境を構築
  * **自動化の活用**: 手動作業によるミスを最小化
  * **緒引き期間**: 旧新両方が動作する一定期間を設定
* **重要な技術的考慮事項（リスク詳細化）:**
  * **MatrixAreaリファクタリング**: 高リスク、Phase3パターンの段階的適用と十分なテストが必須
  * **インポートパス一括更新**: 手動では非常に危険、codemod等の自動化ツール必須
  * **コンポーネント間依存**: 同時リファクタリングは範囲が広すぎるリスク
  * **Next.js設定影響**: ビルド設定、パスエイリアスの再設定が必要
* **パフォーマンス改善:**
  * 重複するFirestoreクエリの統合
  * 不要なre-renderの削減
  * コンポーネントの適切なmemo化
* **今後の拡張性:**
  * 新機能追加時の影響範囲最小化
  * テスト・Storybook・ドキュメント作成の効率化
  * チーム開発での責務分担の明確化
* **ロールバック・緒引き戦略（新規追加）:**
  * **緒引き期間**: 旧新両システムが2週間程度並行稼働
  * **ロールバック手順**: フェーチャーフラグで旧システムへの即座復旧
  * **パフォーマンスモニタリング**: 移行前後の機能・性能比較
  * **ユーザーフィードバック**: ベータテスト的な運用で問題早期発見